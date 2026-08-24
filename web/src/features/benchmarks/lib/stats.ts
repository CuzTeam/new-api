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
import type { BenchmarkComparisonRow } from '../types'

export type CostAccuracyPoint = {
  modelPermaslug: string
  modelName: string
  cost: number
  accuracy: number
}

/** Rows that carry both an accuracy and a cost measurement. */
export function toCostAccuracyPoints(
  rows: BenchmarkComparisonRow[]
): CostAccuracyPoint[] {
  const points: CostAccuracyPoint[] = []
  for (const row of rows) {
    const accuracy = row.median?.accuracy
    const cost = row.median?.avgCostPerTask
    if (accuracy == null || cost == null || cost <= 0) continue
    points.push({
      modelPermaslug: row.modelPermaslug,
      modelName: row.modelName,
      cost,
      accuracy,
    })
  }
  return points
}

/**
 * Compute the Pareto frontier: the set of points where no other point is
 * both more accurate AND cheaper. Returned sorted by ascending cost.
 */
export function computeParetoFrontier(
  points: CostAccuracyPoint[]
): CostAccuracyPoint[] {
  const byCostAsc = [...points].sort((a, b) => a.cost - b.cost)
  const frontier: CostAccuracyPoint[] = []
  let bestAccuracy = -Infinity
  for (const point of byCostAsc) {
    if (point.accuracy > bestAccuracy) {
      frontier.push(point)
      bestAccuracy = point.accuracy
    }
  }
  return frontier
}

/** Permaslugs of all Pareto-optimal models. */
export function paretoPermaslugs(rows: BenchmarkComparisonRow[]): Set<string> {
  return new Set(
    computeParetoFrontier(toCostAccuracyPoints(rows)).map(
      (point) => point.modelPermaslug
    )
  )
}

/**
 * "Best value" per the source methodology: the cheapest Pareto-optimal model
 * within `tolerance` accuracy points of the top score.
 */
export function pickBestValue(
  rows: BenchmarkComparisonRow[],
  tolerance = 0.05
): BenchmarkComparisonRow | null {
  const points = toCostAccuracyPoints(rows)
  if (points.length === 0) return null
  const topAccuracy = Math.max(...points.map((point) => point.accuracy))
  const frontier = computeParetoFrontier(points)
  const candidates = frontier.filter(
    (point) => point.accuracy >= topAccuracy - tolerance
  )
  const pool = candidates.length > 0 ? candidates : frontier
  const cheapest = pool.reduce((best, point) =>
    point.cost < best.cost ? point : best
  )
  return (
    rows.find((row) => row.modelPermaslug === cheapest.modelPermaslug) ?? null
  )
}

export function pickMostAccurate(
  rows: BenchmarkComparisonRow[]
): BenchmarkComparisonRow | null {
  let best: BenchmarkComparisonRow | null = null
  for (const row of rows) {
    if (row.median?.accuracy == null) continue
    if (
      !best ||
      (row.median.accuracy ?? -Infinity) > (best.median?.accuracy ?? -Infinity)
    ) {
      best = row
    }
  }
  return best
}

export function pickLowestCost(
  rows: BenchmarkComparisonRow[]
): BenchmarkComparisonRow | null {
  let best: BenchmarkComparisonRow | null = null
  for (const row of rows) {
    const cost = row.median?.avgCostPerTask
    if (cost == null) continue
    if (!best || cost < (best.median?.avgCostPerTask ?? Infinity)) {
      best = row
    }
  }
  return best
}

/** Comparison rows sorted by accuracy (best first), nulls last. */
export function sortByAccuracyDesc(
  rows: BenchmarkComparisonRow[]
): BenchmarkComparisonRow[] {
  return [...rows].sort(
    (a, b) => (b.median?.accuracy ?? -1) - (a.median?.accuracy ?? -1)
  )
}
