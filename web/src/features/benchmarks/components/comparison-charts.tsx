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
import { VChart } from '@visactor/react-vchart'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useChartTheme } from '@/lib/use-chart-theme'
import { VCHART_OPTION } from '@/lib/vchart'

import { formatAccuracy, formatCostPerTask } from '../lib/format'
import type { BenchmarkComparisonRow } from '../types'

type ComparisonChartsProps = {
  rows: BenchmarkComparisonRow[]
}

type ChartDatum = {
  name: string
  value: number
}

/**
 * Horizontal bar charts for the models selected in the comparison picker:
 * accuracy (best first) and cost per task (cheapest first). The source site
 * also shows a "time per task" chart; the scrape API does not expose
 * per-model latency, so it is omitted.
 */
export function ComparisonCharts(props: ComparisonChartsProps) {
  const { t } = useTranslation()
  const { resolvedTheme, themeReady } = useChartTheme()

  const accuracyData: ChartDatum[] = useMemo(
    () =>
      props.rows
        .filter((row) => row.median?.accuracy != null)
        .map((row) => ({
          name: row.modelName,
          value: row.median?.accuracy ?? 0,
        }))
        .sort((a, b) => a.value - b.value),
    [props.rows]
  )

  const costData: ChartDatum[] = useMemo(
    () =>
      props.rows
        .filter((row) => row.median?.avgCostPerTask != null)
        .map((row) => ({
          name: row.modelName,
          value: row.median?.avgCostPerTask ?? 0,
        }))
        .sort((a, b) => b.value - a.value),
    [props.rows]
  )

  return (
    <div className='grid grid-cols-1 gap-3 xl:grid-cols-2'>
      <HorizontalBarChart
        title={t('Accuracy')}
        description={t('Representative-run accuracy, best first.')}
        data={accuracyData}
        formatValue={(value) => formatAccuracy(value)}
        axisMax={1}
        themeReady={themeReady}
        resolvedTheme={resolvedTheme}
      />
      <HorizontalBarChart
        title={t('Cost per task')}
        description={t('Average cost per graded task, cheapest first.')}
        data={costData}
        formatValue={(value) => formatCostPerTask(value)}
        themeReady={themeReady}
        resolvedTheme={resolvedTheme}
      />
    </div>
  )
}

type HorizontalBarChartProps = {
  title: string
  description: string
  data: ChartDatum[]
  formatValue: (value: number) => string
  axisMax?: number
  themeReady: boolean
  resolvedTheme: string
}

function HorizontalBarChart(props: HorizontalBarChartProps) {
  const { t } = useTranslation()
  const data = props.data
  const formatValue = props.formatValue
  const axisMax = props.axisMax
  const chartTextColor =
    props.resolvedTheme === 'dark'
      ? 'rgba(255, 255, 255, 0.68)'
      : 'rgba(15, 23, 42, 0.58)'
  const chartGridColor =
    props.resolvedTheme === 'dark'
      ? 'rgba(255, 255, 255, 0.12)'
      : 'rgba(15, 23, 42, 0.12)'

  const spec = useMemo(() => {
    if (data.length === 0) return null
    return {
      type: 'bar' as const,
      direction: 'horizontal' as const,
      data: [{ id: 'bars', values: data }],
      xField: 'value',
      yField: 'name',
      barMaxWidth: 18,
      bar: { style: { cornerRadius: [0, 3, 3, 0] } },
      legends: { visible: false },
      padding: { left: 4, right: 16, top: 4, bottom: 4 },
      axes: [
        {
          orient: 'bottom',
          max: axisMax,
          nice: axisMax == null,
          label: {
            formatMethod: (val: number | string) => formatValue(Number(val)),
            style: { fill: chartTextColor, fontSize: 10 },
          },
          grid: {
            visible: true,
            style: { lineDash: [3, 3], stroke: chartGridColor },
          },
        },
        {
          orient: 'left',
          label: {
            style: { fill: chartTextColor, fontSize: 11 },
            autoLimit: true,
          },
          tick: { visible: false },
        },
      ],
      tooltip: {
        mark: {
          content: [
            {
              key: (datum: Record<string, unknown>) =>
                String(datum?.name ?? ''),
              value: (datum: Record<string, unknown>) =>
                formatValue(Number(datum?.value) || 0),
            },
          ],
        },
      },
      animationAppear: { duration: 400 },
    }
  }, [data, formatValue, axisMax, chartTextColor, chartGridColor])

  const height = Math.max(200, props.data.length * 30 + 48)

  return (
    <section className='bg-card rounded-xl border p-4'>
      <h3 className='text-foreground text-sm font-semibold'>{props.title}</h3>
      <p className='text-muted-foreground/80 mt-0.5 text-xs'>
        {props.description}
      </p>
      <div className='mt-3' style={{ height }}>
        {props.themeReady && spec ? (
          <VChart
            key={`${props.title}-${props.resolvedTheme}-${props.data.length}`}
            spec={{
              ...spec,
              theme: props.resolvedTheme === 'dark' ? 'dark' : 'light',
              background: 'transparent',
            }}
            option={VCHART_OPTION}
          />
        ) : (
          <div className='text-muted-foreground/80 flex h-full items-center justify-center text-xs'>
            {t('No data available')}
          </div>
        )}
      </div>
    </section>
  )
}
