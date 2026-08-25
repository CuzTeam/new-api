/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { ArrowDown, ArrowUp, ArrowUpDown, Star } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

import {
  formatAccuracy,
  formatCostPerTask,
  formatRunDate,
  formatStdDev,
} from '../lib/format'
import { paretoPermaslugs } from '../lib/stats'
import type { BenchmarkComparisonRow } from '../types'

type SortKey = 'accuracy' | 'cost' | 'tasks'

type LeaderboardTableProps = {
  rows: BenchmarkComparisonRow[]
}

/**
 * Full model leaderboard with clickable sortable column headers and a star
 * marker on models sitting on the cost/accuracy frontier. The source
 * site's row expansion for provider-pinned results is omitted because the
 * scrape API returns no provider rows.
 */
export function LeaderboardTable(props: LeaderboardTableProps) {
  const { t } = useTranslation()
  const [sortKey, setSortKey] = useState<SortKey>('accuracy')
  const [sortAsc, setSortAsc] = useState(false)

  const paretoSet = useMemo(() => paretoPermaslugs(props.rows), [props.rows])

  const sortedRows = useMemo(() => {
    const valueOf = (row: BenchmarkComparisonRow): number => {
      if (sortKey === 'cost') return row.median?.avgCostPerTask ?? Infinity
      if (sortKey === 'tasks') return row.median?.totalTasks ?? -1
      return row.median?.accuracy ?? -1
    }
    const rows = [...props.rows].sort((a, b) => valueOf(b) - valueOf(a))
    return sortAsc ? rows.reverse() : rows
  }, [props.rows, sortKey, sortAsc])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc)
      return
    }
    setSortKey(key)
    // Accuracy reads best-first; cost reads cheapest-first by default.
    setSortAsc(key === 'cost')
  }

  const columns: Array<{ key: SortKey; label: string }> = [
    { key: 'accuracy', label: t('Accuracy') },
    { key: 'cost', label: t('Cost / task') },
    { key: 'tasks', label: t('Tasks') },
  ]

  return (
    <div className='bg-card overflow-x-auto rounded-xl border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-10 pl-5'>#</TableHead>
            <TableHead>{t('Model')}</TableHead>
            {columns.map((column) => {
              const active = sortKey === column.key
              let Icon = ArrowUpDown
              let ariaSort: 'ascending' | 'descending' | undefined
              if (active) {
                Icon = sortAsc ? ArrowUp : ArrowDown
                ariaSort = sortAsc ? 'ascending' : 'descending'
              }
              return (
                <TableHead key={column.key}>
                  <button
                    type='button'
                    onClick={() => toggleSort(column.key)}
                    aria-sort={ariaSort}
                    className={cn(
                      'hover:text-foreground inline-flex items-center gap-1 transition-colors',
                      active && 'text-foreground'
                    )}
                  >
                    {column.label}
                    <Icon aria-hidden className='size-3.5' />
                  </button>
                </TableHead>
              )
            })}
            <TableHead>{t('Std dev')}</TableHead>
            <TableHead>{t('Providers')}</TableHead>
            <TableHead className='pr-5'>{t('Last run')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedRows.map((row, index) => (
            <TableRow key={row.modelPermaslug}>
              <TableCell className='text-muted-foreground pl-5 font-mono text-xs tabular-nums'>
                {index + 1}
              </TableCell>
              <TableCell>
                <span className='text-foreground font-medium'>
                  {row.modelName}
                </span>
                {paretoSet.has(row.modelPermaslug) && (
                  <Star
                    aria-hidden
                    className='ml-1.5 inline size-3.5 fill-yellow-400 text-yellow-400'
                  />
                )}
              </TableCell>
              <TableCell className='font-mono tabular-nums'>
                {formatAccuracy(row.median?.accuracy)}
              </TableCell>
              <TableCell className='font-mono tabular-nums'>
                {formatCostPerTask(row.median?.avgCostPerTask)}
              </TableCell>
              <TableCell className='font-mono tabular-nums'>
                {row.median?.totalTasks ?? '-'}
              </TableCell>
              <TableCell className='text-muted-foreground font-mono text-xs tabular-nums'>
                {formatStdDev(row.median?.accuracyStdDev)}
              </TableCell>
              <TableCell className='text-muted-foreground font-mono text-xs tabular-nums'>
                {row.median?.provCount ?? '-'}
              </TableCell>
              <TableCell className='text-muted-foreground pr-5 text-xs whitespace-nowrap'>
                {formatRunDate(row.median?.lastRunTimestamp)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
