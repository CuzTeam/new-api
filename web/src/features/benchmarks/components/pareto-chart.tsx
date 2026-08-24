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
import { computeParetoFrontier, toCostAccuracyPoints } from '../lib/stats'
import type { BenchmarkComparisonRow } from '../types'

type ParetoChartProps = {
  rows: BenchmarkComparisonRow[]
}

/**
 * Accuracy-vs-cost scatter with the Pareto frontier drawn as a dashed line:
 * no model beats a frontier point on both axes at once.
 */
export function ParetoChart(props: ParetoChartProps) {
  const { t } = useTranslation()
  const { resolvedTheme, themeReady } = useChartTheme()
  const chartTextColor =
    resolvedTheme === 'dark'
      ? 'rgba(255, 255, 255, 0.68)'
      : 'rgba(15, 23, 42, 0.58)'
  const chartGridColor =
    resolvedTheme === 'dark'
      ? 'rgba(255, 255, 255, 0.12)'
      : 'rgba(15, 23, 42, 0.12)'

  const points = useMemo(() => toCostAccuracyPoints(props.rows), [props.rows])
  const frontier = useMemo(() => computeParetoFrontier(points), [points])

  const spec = useMemo(() => {
    if (points.length === 0) return null
    return {
      type: 'common' as const,
      series: [
        {
          type: 'scatter' as const,
          data: [
            {
              id: 'points',
              values: points.map((point) => ({
                ...point,
                frontier: frontier.some(
                  (f) => f.modelPermaslug === point.modelPermaslug
                ),
              })),
            },
          ],
          xField: 'cost',
          yField: 'accuracy',
          seriesField: 'frontier',
          point: { style: { size: 7, fillOpacity: 0.85 } },
        },
        {
          type: 'line' as const,
          data: [{ id: 'frontier', values: frontier }],
          xField: 'cost',
          yField: 'accuracy',
          point: { visible: false },
          line: {
            style: {
              lineDash: [5, 4],
              stroke: resolvedTheme === 'dark' ? '#a3e635' : '#65a30d',
              lineWidth: 1.5,
            },
          },
          animation: false,
        },
      ],
      legends: { visible: false },
      axes: [
        {
          orient: 'bottom',
          type: 'log',
          label: {
            formatMethod: (val: number | string) =>
              formatCostPerTask(Number(val)),
            style: { fill: chartTextColor, fontSize: 10 },
          },
          grid: {
            visible: true,
            style: { lineDash: [3, 3], stroke: chartGridColor },
          },
          title: { visible: true, text: t('Cost per task') },
        },
        {
          orient: 'left',
          min: 0,
          max: 1,
          label: {
            formatMethod: (val: number | string) => formatAccuracy(Number(val)),
            style: { fill: chartTextColor, fontSize: 10 },
          },
          grid: {
            visible: true,
            style: { lineDash: [3, 3], stroke: chartGridColor },
          },
          title: { visible: true, text: t('Accuracy') },
        },
      ],
      tooltip: {
        mark: {
          content: [
            {
              key: (datum: Record<string, unknown>) =>
                String(datum?.modelName ?? ''),
              value: (datum: Record<string, unknown>) =>
                `${formatAccuracy(Number(datum?.accuracy))} · ${formatCostPerTask(Number(datum?.cost))}`,
            },
          ],
        },
      },
      animationAppear: { duration: 400 },
    }
  }, [points, frontier, resolvedTheme, chartTextColor, chartGridColor, t])

  return (
    <div className='h-80 sm:h-96'>
      {themeReady && spec ? (
        <VChart
          key={`pareto-${resolvedTheme}`}
          spec={{
            ...spec,
            theme: resolvedTheme === 'dark' ? 'dark' : 'light',
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
  )
}
