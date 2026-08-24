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
import { describe, expect, it } from 'vitest'

import type { BenchmarkComparisonRow } from '../../types'
import {
  computeParetoFrontier,
  pickBestValue,
  pickLowestCost,
  pickMostAccurate,
  sortByAccuracyDesc,
  toCostAccuracyPoints,
  type CostAccuracyPoint,
} from '../stats'

function makeRow(
  permaslug: string,
  accuracy: number | null,
  cost: number | null
): BenchmarkComparisonRow {
  return {
    modelPermaslug: permaslug,
    modelName: permaslug,
    providers: [],
    median: {
      modelPermaslug: permaslug,
      modelName: permaslug,
      accuracy,
      accuracyStdDev: null,
      avgCostPerTask: cost,
      totalTasks: 100,
    },
  }
}

function point(
  modelPermaslug: string,
  cost: number,
  accuracy: number
): CostAccuracyPoint {
  return { modelPermaslug, modelName: modelPermaslug, cost, accuracy }
}

describe('toCostAccuracyPoints', () => {
  it('drops rows missing accuracy or cost', () => {
    const points = toCostAccuracyPoints([
      makeRow('a', 0.9, 0.01),
      makeRow('b', null, 0.01),
      makeRow('c', 0.8, null),
    ])
    expect(points.map((p) => p.modelPermaslug)).toEqual(['a'])
  })

  it('drops rows with zero or negative cost since a log axis cannot show them', () => {
    const points = toCostAccuracyPoints([
      makeRow('free', 0.9, 0),
      makeRow('paid', 0.8, 0.01),
    ])
    expect(points.map((p) => p.modelPermaslug)).toEqual(['paid'])
  })
})

describe('computeParetoFrontier', () => {
  it('keeps points that are not dominated on both cost and accuracy', () => {
    const frontier = computeParetoFrontier([
      point('cheap-weak', 0.01, 0.5),
      point('cheap-strong', 0.02, 0.8),
      point('expensive-weak', 0.05, 0.7),
      point('expensive-strong', 0.1, 0.9),
    ])
    expect(frontier.map((p) => p.modelPermaslug)).toEqual([
      'cheap-weak',
      'cheap-strong',
      'expensive-strong',
    ])
  })

  it('returns points sorted by ascending cost', () => {
    const frontier = computeParetoFrontier([
      point('b', 0.1, 0.9),
      point('a', 0.01, 0.5),
    ])
    expect(frontier.map((p) => p.modelPermaslug)).toEqual(['a', 'b'])
  })

  it('returns an empty frontier for empty input', () => {
    expect(computeParetoFrontier([])).toEqual([])
  })
})

describe('pickBestValue', () => {
  it('picks the cheapest Pareto model within 5pp of the top accuracy', () => {
    const rows = [
      makeRow('top', 0.9, 1.0),
      makeRow('value', 0.86, 0.02),
      makeRow('too-weak', 0.8, 0.01),
    ]
    expect(pickBestValue(rows)?.modelPermaslug).toBe('value')
  })

  it('picks the top model when nothing cheaper is within tolerance', () => {
    const rows = [makeRow('top', 0.9, 1.0), makeRow('weak', 0.5, 0.01)]
    expect(pickBestValue(rows)?.modelPermaslug).toBe('top')
  })

  it('returns null when no row has both metrics', () => {
    expect(pickBestValue([makeRow('a', 0.9, null)])).toBeNull()
  })
})

describe('pickMostAccurate / pickLowestCost', () => {
  it('picks the maxima while ignoring null measurements', () => {
    const rows = [
      makeRow('null-acc', null, 0.5),
      makeRow('best-acc', 0.9, 1.0),
      makeRow('best-cost', 0.7, 0.01),
    ]
    expect(pickMostAccurate(rows)?.modelPermaslug).toBe('best-acc')
    expect(pickLowestCost(rows)?.modelPermaslug).toBe('best-cost')
  })

  it('returns null for empty input', () => {
    expect(pickMostAccurate([])).toBeNull()
    expect(pickLowestCost([])).toBeNull()
  })
})

describe('sortByAccuracyDesc', () => {
  it('sorts best first and places null accuracy last', () => {
    const sorted = sortByAccuracyDesc([
      makeRow('unknown', null, 0.01),
      makeRow('low', 0.5, 0.01),
      makeRow('high', 0.9, 0.01),
    ])
    expect(sorted.map((row) => row.modelPermaslug)).toEqual([
      'high',
      'low',
      'unknown',
    ])
  })
})
