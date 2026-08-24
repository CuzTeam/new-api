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
import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { CATEGORY_ICONS, DEFAULT_CATEGORY_ICON } from '../constants'
import { formatLeaderValue, formatRunDate } from '../lib/format'
import type { BenchmarkCategory, BenchmarkEntry } from '../types'

type BenchmarkSectionProps = {
  category: BenchmarkCategory
  benchmarks: BenchmarkEntry[]
}

/**
 * One category section on the benchmarks index page: a header plus a row per
 * benchmark showing its quality / value / speed leaders. Clicking a row
 * navigates to the benchmark detail page.
 */
export function BenchmarkSection(props: BenchmarkSectionProps) {
  const { t } = useTranslation()
  const Icon = CATEGORY_ICONS[props.category.id] ?? DEFAULT_CATEGORY_ICON

  return (
    <section
      id={props.category.id}
      aria-labelledby={`benchmarks-${props.category.id}-title`}
      className='scroll-mt-28'
    >
      <h2
        id={`benchmarks-${props.category.id}-title`}
        className='text-foreground flex items-center gap-2 text-xl font-semibold'
      >
        <Icon aria-hidden className='text-primary size-5' />
        {t(props.category.label)}
      </h2>

      <div className='mt-4'>
        <div
          aria-hidden
          className='text-muted-foreground hidden grid-cols-[minmax(0,1fr)_repeat(3,minmax(7rem,10rem))] gap-4 px-5 pb-2 text-xs font-medium tracking-wider uppercase md:grid'
        >
          <span>{t('Benchmark')}</span>
          <span>{t('Quality')}</span>
          <span>{t('Value')}</span>
          <span>{t('Speed')}</span>
        </div>
        <div className='space-y-3'>
          {props.benchmarks.map((benchmark) => (
            <BenchmarkRow key={benchmark.slug} benchmark={benchmark} />
          ))}
        </div>
      </div>
    </section>
  )
}

function BenchmarkRow(props: { benchmark: BenchmarkEntry }) {
  const { t } = useTranslation()
  const benchmark = props.benchmark
  const leaders: Array<{ label: string; value: string | undefined }> = [
    { label: t('Quality'), value: benchmark.leaders?.quality },
    { label: t('Value'), value: benchmark.leaders?.value },
    { label: t('Speed'), value: benchmark.leaders?.speed },
  ]

  return (
    <Link
      to='/benchmarks/$slug'
      params={{ slug: benchmark.slug }}
      className='group bg-card hover:border-primary/40 grid grid-cols-1 gap-4 rounded-xl border p-5 transition-colors md:grid-cols-[minmax(0,1fr)_repeat(3,minmax(7rem,10rem))] md:items-center'
    >
      <div className='min-w-0'>
        <div className='text-foreground group-hover:text-primary inline-flex items-center gap-1 text-base font-semibold transition-colors'>
          <span className='truncate'>{benchmark.name}</span>
          <ChevronRight
            aria-hidden
            className='text-muted-foreground group-hover:text-primary size-4 shrink-0 transition-transform group-hover:translate-x-0.5'
          />
        </div>
        {benchmark.blurb && (
          <p className='text-muted-foreground mt-1 text-sm'>
            {benchmark.blurb}
          </p>
        )}
        <p className='text-muted-foreground/80 mt-2 text-xs'>
          {t('{{count}} models', {
            count: benchmark.stats?.modelCount ?? 0,
          })}
          <span aria-hidden className='mx-2'>
            ·
          </span>
          {t('last run {{date}}', {
            date: formatRunDate(benchmark.stats?.lastRunTimestamp),
          })}
        </p>
      </div>

      {leaders.map((leader) => (
        <div key={leader.label} className='flex items-baseline gap-2 md:block'>
          <div className='text-foreground font-mono text-base font-semibold tabular-nums'>
            {formatLeaderValue(leader.value)}
          </div>
          <div className='text-muted-foreground/80 text-xs md:mt-1 md:hidden'>
            {leader.label}
          </div>
        </div>
      ))}
    </Link>
  )
}
