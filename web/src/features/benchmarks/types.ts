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
/** Shapes mirrored from https://benchmark.c0ffee.space/openapi.json */

export type BenchmarkCategory = {
  id: string
  label: string
  icon?: string
}

export type BenchmarkStats = {
  modelCount?: number
  providerCount?: number
  runCount?: number
  taskCount?: number
  lastRunTimestamp?: string
}

export type BenchmarkLeaders = {
  quality?: string
  value?: string
  speed?: string
}

export type BenchmarkEntry = {
  slug: string
  name: string
  category: string
  blurb?: string
  stats?: BenchmarkStats
  leaders?: BenchmarkLeaders
}

export type BenchmarksIndex = {
  provenance: string
  fetchedAt: string
  url: string
  categories: BenchmarkCategory[]
  benchmarks: BenchmarkEntry[]
  rawCounts?: {
    benchmarks?: number
    taskEvaluations?: number
    lastRun?: string | null
  }
}

export type BenchmarkMedian = {
  modelPermaslug: string
  modelName: string
  providerName?: string
  accuracy: number | null
  accuracyStdDev: number | null
  avgCostPerTask: number | null
  totalTasks: number | null
  lastRunTimestamp?: string
  provCount?: number
}

export type BenchmarkComparisonRow = {
  modelPermaslug: string
  modelName: string
  author?: string
  median: BenchmarkMedian | null
  providers: unknown[]
}

export type BenchmarkDetail = {
  provenance: string
  fetchedAt: string
  url: string
  slug: string
  entry?: BenchmarkEntry
  comparison: BenchmarkComparisonRow[]
  leaderboardPreview?: BenchmarkMedian[]
  counts?: {
    modelRows?: number
    providerRows?: number
    accuracySamples?: number
  }
}
