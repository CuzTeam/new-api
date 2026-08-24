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
import dayjs from '@/lib/dayjs'

/** Format a 0-1 accuracy ratio as a percentage string, e.g. 0.815 -> "81.5%". */
export function formatAccuracy(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '-'
  return `${(value * 100).toFixed(1)}%`
}

/** Format an accuracy standard deviation, e.g. 0.013 -> "±1.3pp". */
export function formatStdDev(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '--'
  return `±${(value * 100).toFixed(1)}pp`
}

/** Format a USD cost per task with enough precision for tiny amounts. */
export function formatCostPerTask(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '-'
  if (value >= 1) return `$${value.toFixed(2)}`
  return `$${value.toPrecision(2)}`
}

/**
 * Normalize leader metric strings from the scrape API.
 * The scraper sometimes emits doubled currency signs ("$$0.020").
 */
export function formatLeaderValue(raw: string | null | undefined): string {
  if (!raw) return '-'
  return raw.replace(/^\$+/, '$')
}

/**
 * Parse the API's mixed timestamp formats ("2026-08-22T08:19:46.447Z" and
 * "2026-08-18 02:39:27.062+00") into a valid dayjs date.
 */
export function parseBenchmarkTimestamp(raw: string | null | undefined) {
  if (!raw) return null
  const normalized = raw.includes('T')
    ? raw
    : raw.replace(' ', 'T').replace(/\+00(:00)?$/, 'Z')
  const parsed = dayjs(normalized)
  return parsed.isValid() ? parsed : null
}

/** Format a run timestamp like the source site, e.g. "Aug 23, 2026". */
export function formatRunDate(raw: string | null | undefined): string {
  const parsed = parseBenchmarkTimestamp(raw)
  return parsed ? parsed.format('MMM D, YYYY') : '-'
}

/** Format a run timestamp with time, e.g. "Aug 23, 2026, 6:00 PM UTC". */
export function formatRunDateTime(raw: string | null | undefined): string {
  const parsed = parseBenchmarkTimestamp(raw)
  return parsed ? parsed.format('MMM D, YYYY, h:mm A') : '-'
}
