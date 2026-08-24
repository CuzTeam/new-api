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
import {
  BarChart3,
  FlaskConical,
  Globe,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

/**
 * Public read-only benchmark API (Cloudflare Worker scraping
 * openrouter.ai/benchmarks). CORS is open, so the frontend calls it directly.
 */
export const BENCHMARK_API_BASE = 'https://benchmark.c0ffee.space'

export const BENCHMARK_API_DOCS_URL = `${BENCHMARK_API_BASE}/openapi.json`

/** Map a benchmark category id to a representative icon. */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  agents: Wrench,
  reasoning: FlaskConical,
  search: Globe,
}

export const DEFAULT_CATEGORY_ICON: LucideIcon = BarChart3

/** Number of models pre-selected in the detail-page comparison charts. */
export const DEFAULT_SELECTED_MODELS = 10
