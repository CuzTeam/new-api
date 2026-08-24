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
import { BENCHMARK_API_BASE } from './constants'
import type { BenchmarkDetail, BenchmarksIndex } from './types'

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BENCHMARK_API_BASE}${path}`, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) {
    throw new Error(`Benchmark API request failed with status ${res.status}`)
  }
  return (await res.json()) as T
}

export function fetchBenchmarksIndex(): Promise<BenchmarksIndex> {
  return fetchJson<BenchmarksIndex>('/api/benchmarks')
}

export function fetchBenchmarkDetail(slug: string): Promise<BenchmarkDetail> {
  return fetchJson<BenchmarkDetail>(
    `/api/benchmarks/${encodeURIComponent(slug)}`
  )
}
