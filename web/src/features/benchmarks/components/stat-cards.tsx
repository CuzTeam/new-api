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
import { useTranslation } from 'react-i18next'

import { stringToColor } from '@/lib/format'

import { formatAccuracy, formatCostPerTask } from '../lib/format'
import { pickBestValue, pickLowestCost, pickMostAccurate } from '../lib/stats'
import type { BenchmarkComparisonRow } from '../types'

type StatCardsProps = {
  rows: BenchmarkComparisonRow[]
}

/**
 * The three headline cards above the comparison charts. The source site's
 * "Fastest" card is replaced by "Lowest cost" because the scrape API does
 * not expose per-model latency.
 */
export function BenchmarkStatCards(props: StatCardsProps) {
  const { t } = useTranslation()
  const mostAccurate = pickMostAccurate(props.rows)
  const bestValue = pickBestValue(props.rows)
  const lowestCost = pickLowestCost(props.rows)

  const cards = [
    {
      label: t('Most Accurate'),
      row: mostAccurate,
      value: formatAccuracy(mostAccurate?.median?.accuracy),
    },
    {
      label: t('Best Value'),
      row: bestValue,
      value: `${formatCostPerTask(bestValue?.median?.avgCostPerTask)}${t('/task')}`,
    },
    {
      label: t('Lowest Cost'),
      row: lowestCost,
      value: `${formatCostPerTask(lowestCost?.median?.avgCostPerTask)}${t('/task')}`,
    },
  ]

  return (
    <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
      {cards.map((card) => (
        <div key={card.label} className='bg-card rounded-xl border p-4'>
          <div className='text-muted-foreground text-xs font-medium tracking-wider uppercase'>
            {card.label}
          </div>
          {card.row ? (
            <div className='mt-3 flex items-center gap-2'>
              <span
                aria-hidden
                className='flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white'
                style={{
                  backgroundColor: stringToColor(card.row.author ?? ''),
                }}
              >
                {(card.row.author ?? '?').slice(0, 1).toUpperCase()}
              </span>
              <span className='text-foreground truncate text-sm font-medium'>
                {card.row.modelName}
              </span>
            </div>
          ) : (
            <div className='text-muted-foreground mt-3 text-sm'>-</div>
          )}
          <div className='text-foreground mt-1 font-mono text-lg font-semibold tabular-nums'>
            {card.value}
          </div>
        </div>
      ))}
    </div>
  )
}
