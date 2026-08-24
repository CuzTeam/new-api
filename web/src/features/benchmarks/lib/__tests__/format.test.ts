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

import {
  formatAccuracy,
  formatCostPerTask,
  formatLeaderValue,
  formatRunDate,
  parseBenchmarkTimestamp,
} from '../format'

describe('formatAccuracy', () => {
  it('formats a 0-1 ratio as a one-decimal percentage', () => {
    expect(formatAccuracy(0.815)).toBe('81.5%')
    expect(formatAccuracy(1)).toBe('100.0%')
  })

  it('renders a dash for missing values', () => {
    expect(formatAccuracy(null)).toBe('-')
    expect(formatAccuracy(undefined)).toBe('-')
  })
})

describe('formatCostPerTask', () => {
  it('keeps two decimals for costs at or above one dollar', () => {
    expect(formatCostPerTask(1.01)).toBe('$1.01')
    expect(formatCostPerTask(12.5)).toBe('$12.50')
  })

  it('keeps significant digits for sub-dollar costs', () => {
    expect(formatCostPerTask(0.02)).toBe('$0.020')
    expect(formatCostPerTask(0.005)).toBe('$0.0050')
  })

  it('renders a dash for missing values', () => {
    expect(formatCostPerTask(null)).toBe('-')
  })
})

describe('formatLeaderValue', () => {
  it('collapses the doubled currency sign emitted by the scraper', () => {
    expect(formatLeaderValue('$$0.020')).toBe('$0.020')
    expect(formatLeaderValue('$0.99')).toBe('$0.99')
  })

  it('passes through non-currency leader strings', () => {
    expect(formatLeaderValue('81.5%')).toBe('81.5%')
    expect(formatLeaderValue('1.8m')).toBe('1.8m')
  })

  it('renders a dash for missing values', () => {
    expect(formatLeaderValue(null)).toBe('-')
    expect(formatLeaderValue('')).toBe('-')
  })
})

describe('parseBenchmarkTimestamp', () => {
  it('parses ISO timestamps', () => {
    expect(parseBenchmarkTimestamp('2026-08-22T08:19:46.447Z')?.isValid()).toBe(
      true
    )
  })

  it('parses the scraper\'s "YYYY-MM-DD HH:mm:ss.SSS+00" variant', () => {
    const parsed = parseBenchmarkTimestamp('2026-08-18 02:39:27.062+00')
    expect(parsed?.isValid()).toBe(true)
    expect(parsed?.format('YYYY-MM-DD')).toBe('2026-08-18')
  })

  it('returns null for missing or invalid input', () => {
    expect(parseBenchmarkTimestamp(null)).toBeNull()
    expect(parseBenchmarkTimestamp('not a date')).toBeNull()
  })
})

describe('formatRunDate', () => {
  it('formats like the source site', () => {
    expect(formatRunDate('2026-08-22T08:19:46.447Z')).toMatch(
      /^Aug 2[12-23], 2026$/
    )
  })

  it('renders a dash for unparseable input', () => {
    expect(formatRunDate('nonsense')).toBe('-')
  })
})
