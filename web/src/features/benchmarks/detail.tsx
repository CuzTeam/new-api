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
import {
  ArrowLeft,
  ChartColumn,
  ChartScatter,
  CodeXml,
  Trophy,
} from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { PublicLayout } from '@/components/layout'
import { PageTransition } from '@/components/page-transition'
import { Skeleton } from '@/components/ui/skeleton'
import { formatNumber } from '@/lib/format'

import { ComparisonCharts } from './components/comparison-charts'
import { LeaderboardTable } from './components/leaderboard-table'
import { ModelMultiSelect } from './components/model-multi-select'
import { ParetoChart } from './components/pareto-chart'
import { BenchmarksSideNav, type SideNavItem } from './components/side-nav'
import { BenchmarkStatCards } from './components/stat-cards'
import { BENCHMARK_API_BASE, DEFAULT_SELECTED_MODELS } from './constants'
import { useBenchmarkDetail, useBenchmarksIndex } from './hooks/use-benchmarks'
import { useScrollSpy } from './hooks/use-scroll-spy'
import { formatRunDateTime } from './lib/format'
import { sortByAccuracyDesc } from './lib/stats'

const SECTION_IDS = [
  'comparison',
  'cost-efficiency',
  'leaderboard',
  'api-access',
]

export function BenchmarkDetail(props: { slug: string }) {
  const { t } = useTranslation()
  const detailQuery = useBenchmarkDetail(props.slug)
  // The index carries the blurb/stats that the detail endpoint omits.
  const indexQuery = useBenchmarksIndex()
  const detail = detailQuery.data
  const entry = useMemo(
    () =>
      indexQuery.data?.benchmarks.find(
        (benchmark) => benchmark.slug === props.slug
      ) ?? detail?.entry,
    [indexQuery.data, detail, props.slug]
  )

  const orderedRows = useMemo(
    () => sortByAccuracyDesc(detail?.comparison ?? []),
    [detail]
  )

  const [selected, setSelected] = useState<string[]>([])
  useEffect(() => {
    setSelected(
      orderedRows
        .slice(0, DEFAULT_SELECTED_MODELS)
        .map((row) => row.modelPermaslug)
    )
  }, [orderedRows])

  const selectedRows = useMemo(
    () => orderedRows.filter((row) => selected.includes(row.modelPermaslug)),
    [orderedRows, selected]
  )

  const navItems: SideNavItem[] = useMemo(
    () => [
      { id: 'comparison', label: t('Model comparison'), icon: ChartColumn },
      {
        id: 'cost-efficiency',
        label: t('Cost efficiency'),
        icon: ChartScatter,
      },
      { id: 'leaderboard', label: t('Leaderboard'), icon: Trophy },
      { id: 'api-access', label: t('API access'), icon: CodeXml },
    ],
    [t]
  )
  const { activeId, scrollTo } = useScrollSpy(SECTION_IDS)

  const lastRun =
    entry?.stats?.lastRunTimestamp ??
    detail?.comparison?.[0]?.median?.lastRunTimestamp

  let body: ReactNode
  if (detailQuery.isLoading) {
    body = <DetailLoading />
  } else if (!detail) {
    body = (
      <DetailError
        message={
          detailQuery.error instanceof Error
            ? detailQuery.error.message
            : t('Unable to load benchmark data')
        }
      />
    )
  } else {
    body = (
      <>
        <header className='mt-4 max-w-3xl'>
          <h1 className='text-foreground text-3xl font-bold tracking-tight'>
            {entry?.name ?? detail.slug}
          </h1>
          {entry?.blurb && (
            <p className='text-muted-foreground mt-3 text-base'>
              {entry.blurb}
            </p>
          )}
          <p className='text-muted-foreground mt-4 text-sm tabular-nums'>
            {t('Last benchmark run {{date}}', {
              date: formatRunDateTime(lastRun),
            })}
            <span aria-hidden className='mx-2'>
              ·
            </span>
            {t('{{count}} models', {
              count: detail.counts?.modelRows ?? orderedRows.length,
            })}
            <span aria-hidden className='mx-2'>
              ·
            </span>
            {t('{{count}} task evaluations', {
              count: formatNumber(entry?.stats?.taskCount),
            })}
          </p>
        </header>

        <div className='mt-10 flex gap-10'>
          <BenchmarksSideNav
            items={navItems}
            activeId={activeId}
            onSelect={scrollTo}
          />
          <div className='min-w-0 flex-1 space-y-12'>
            <section
              id='comparison'
              aria-labelledby='benchmark-comparison-title'
              className='scroll-mt-28'
            >
              <h2
                id='benchmark-comparison-title'
                className='text-foreground text-xl font-semibold'
              >
                {t('Model comparison')}
              </h2>
              <div className='mt-4 space-y-4'>
                <ModelMultiSelect
                  options={orderedRows.map((row) => ({
                    permaslug: row.modelPermaslug,
                    name: row.modelName,
                  }))}
                  selected={selected}
                  onChange={setSelected}
                />
                <BenchmarkStatCards rows={orderedRows} />
                <ComparisonCharts rows={selectedRows} />
              </div>
            </section>

            <section
              id='cost-efficiency'
              aria-labelledby='benchmark-cost-efficiency-title'
              className='scroll-mt-28'
            >
              <h2
                id='benchmark-cost-efficiency-title'
                className='text-foreground text-xl font-semibold'
              >
                {t('Cost efficiency')}
              </h2>
              <p className='text-muted-foreground mt-1 text-sm'>
                {t(
                  'Accuracy vs. cost, one point per model. The dashed line is the Pareto frontier: no model beats these on both accuracy and cost.'
                )}
              </p>
              <div className='bg-card mt-4 rounded-xl border p-4'>
                <ParetoChart rows={orderedRows} />
              </div>
            </section>

            <section
              id='leaderboard'
              aria-labelledby='benchmark-leaderboard-title'
              className='scroll-mt-28'
            >
              <h2
                id='benchmark-leaderboard-title'
                className='text-foreground text-xl font-semibold'
              >
                {t('Leaderboard')}
              </h2>
              <p className='text-muted-foreground mt-1 mb-4 text-sm'>
                {t(
                  'Rows use representative runs; click a column header to sort.'
                )}
              </p>
              <LeaderboardTable rows={orderedRows} />
            </section>

            <section
              id='api-access'
              aria-labelledby='benchmark-api-access-title'
              className='scroll-mt-28'
            >
              <h2
                id='benchmark-api-access-title'
                className='text-foreground text-xl font-semibold'
              >
                {t('API access')}
              </h2>
              <p className='text-muted-foreground mt-1 text-sm'>
                {t(
                  'This page is rendered from the public benchmark API; the same results are available programmatically.'
                )}
              </p>
              <div className='bg-card mt-4 rounded-xl border p-4'>
                <code className='text-foreground block overflow-x-auto font-mono text-xs whitespace-nowrap'>
                  GET {BENCHMARK_API_BASE}/api/benchmarks/{detail.slug}
                </code>
              </div>
            </section>
          </div>
        </div>
      </>
    )
  }

  return (
    <PublicLayout showMainContainer={false}>
      <PageTransition className='relative mx-auto w-full max-w-[1280px] px-3 pt-16 pb-10 sm:px-6 sm:pt-20 sm:pb-12 xl:px-8'>
        <Link
          to='/benchmarks'
          className='text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm transition-colors'
        >
          <ArrowLeft aria-hidden className='size-4' />
          {t('All benchmarks')}
        </Link>

        {body}
      </PageTransition>
    </PublicLayout>
  )
}

function DetailLoading() {
  return (
    <div className='mt-6 space-y-6'>
      <Skeleton className='h-10 w-64 rounded-lg' />
      <Skeleton className='h-5 w-full max-w-xl rounded-lg' />
      <Skeleton className='h-[320px] w-full rounded-xl' />
      <Skeleton className='h-[420px] w-full rounded-xl' />
    </div>
  )
}

function DetailError(props: { message: string }) {
  const { t } = useTranslation()
  return (
    <div className='bg-card mt-6 rounded-xl border border-dashed px-6 py-12 text-center'>
      <h2 className='text-foreground text-base font-semibold'>
        {t('Unable to load benchmark')}
      </h2>
      <p className='text-muted-foreground mx-auto mt-2 max-w-md text-sm'>
        {props.message}
      </p>
    </div>
  )
}
