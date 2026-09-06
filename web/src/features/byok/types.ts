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
import { z } from 'zod'

// ============================================================================
// BYOK Schema & Types
// ============================================================================

export const BYOK_KEY_STATUS_ENABLED = 1
export const BYOK_KEY_STATUS_DISABLED = 2

export const byokKeySchema = z.object({
  id: z.number(),
  user_id: z.number(),
  channel_type: z.number(),
  name: z.string(),
  key_hint: z.string(),
  model_list: z.string(),
  mode: z.string(),
  status: z.number(),
  created_time: z.number(),
  accessed_time: z.number(),
})

export type ByokKey = z.infer<typeof byokKeySchema>

export interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  data?: T
}

export interface ByokStatus {
  enabled: boolean
  service_fee_usd: number
  supported_types: number[]
}

export interface ByokKeyFormData {
  channel_type: number
  name: string
  key: string
  model_list: string[]
  mode: string
  status?: number
}
