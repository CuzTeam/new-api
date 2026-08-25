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
import { useMemo, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { PublicLayout } from '@/components/layout'
import { PageTransition } from '@/components/page-transition'
import { Skeleton } from '@/components/ui/skeleton'
import { formatNumber } from '@/lib/format'

import { BenchmarkSection } from './components/benchmark-section'
import { BenchmarksSideNav, type SideNavItem } from './components/side-nav'
import { CATEGORY_ICONS, DEFAULT_CATEGORY_ICON } from './constants'
import { useBenchmarksIndex } from './hooks/use-benchmarks'
import { useScrollSpy } from './hooks/use-scroll-spy'
import { parseBenchmarkTimestamp } from './lib/format'

export function Benchmarks() {
  const { t } = useTranslation()
  const indexQuery = useBenchmarksIndex()
  const index = indexQuery.data

  const sections = useMemo(() => {
    if (!index) return []
    return index.categories.map((category) => ({
      category,
      benchmarks: index.benchmarks.filter(
        (benchmark) => benchmark.category === category.id
      ),
    }))
  }, [index])

  const navItems: SideNavItem[] = useMemo(
    () =>
      sections.map((section) => ({
        id: section.category.id,
        label: t(section.category.label),
        icon: CATEGORY_ICONS[section.category.id] ?? DEFAULT_CATEGORY_ICON,
      })),
    [sections, t]
  )
  const { activeId, scrollTo } = useScrollSpy(navItems.map((item) => item.id))

  const lastRun = useMemo(() => {
    if (!index) return null
    let latest: ReturnType<typeof parseBenchmarkTimestamp> = null
    for (const benchmark of index.benchmarks) {
      const ts = parseBenchmarkTimestamp(benchmark.stats?.lastRunTimestamp)
      if (ts && (!latest || ts.isAfter(latest))) latest = ts
    }
    return latest
  }, [index])

  let body: ReactNode
  if (indexQuery.isLoading) {
    body = <BenchmarksLoading />
  } else if (!index) {
    body = (
      <BenchmarksError
        message={
          indexQuery.error instanceof Error
            ? indexQuery.error.message
            : t('Unable to load benchmarks data')
        }
      />
    )
  } else {
    body = (
      <div className='mt-10 flex gap-10'>
        <BenchmarksSideNav
          items={navItems}
          activeId={activeId}
          onSelect={scrollTo}
        />
        <div className='min-w-0 flex-1 space-y-12'>
          {sections.map((section) => (
            <BenchmarkSection
              key={section.category.id}
              category={section.category}
              benchmarks={section.benchmarks}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <PublicLayout showMainContainer={false}>
      <PageTransition className='relative mx-auto w-full max-w-[1280px] px-3 pt-16 pb-10 sm:px-6 sm:pt-20 sm:pb-12 xl:px-8'>
        <header className='max-w-2xl'>
          <div className='max-w-2xl'>
            <h1 className='text-foreground text-3xl font-bold tracking-tight'>
              {t('Benchmarks')}
            </h1>
            <p className='text-muted-foreground mt-3 text-base'>
              {t(
                'Independent, reproducible measurements of the knobs you can actually set on a request: models, providers, and tool budgets. Every score links to the configuration, costs, and telemetry behind it.'
              )}
            </p>
            {index && (
              <p className='text-muted-foreground mt-4 text-sm tabular-nums'>
                {t('{{count}} benchmarks', {
                  count: index.rawCounts?.benchmarks ?? index.benchmarks.length,
                })}
                <span aria-hidden className='mx-2'>
                  ·
                </span>
                {t('{{count}} task evaluations', {
                  count: formatNumber(index.rawCounts?.taskEvaluations),
                })}
                {lastRun && (
                  <>
                    <span aria-hidden className='mx-2'>
                      ·
                    </span>
                    {t('last run {{date}}', {
                      date: lastRun.format('MMM D, YYYY'),
                    })}
                  </>
                )}
              </p>
            )}
          </div>
        </header>

        {body}
      </PageTransition>
    </PublicLayout>
  )
}

function BenchmarksLoading() {
  return (
    <div className='mt-10 space-y-8'>
      <Skeleton className='h-[180px] w-full rounded-xl' />
      <Skeleton className='h-[180px] w-full rounded-xl' />
      <Skeleton className='h-[400px] w-full rounded-xl' />
    </div>
  )
}

function BenchmarksError(props: { message: string }) {
  const { t } = useTranslation()
  return (
    <div className='bg-card mt-10 rounded-xl border border-dashed px-6 py-12 text-center'>
      <h2 className='text-foreground text-base font-semibold'>
        {t('Unable to load benchmarks')}
      </h2>
      <p className='text-muted-foreground mx-auto mt-2 max-w-md text-sm'>
        {props.message}
      </p>
    </div>
  )
}
