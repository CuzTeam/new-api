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
  BYOK_KEY_STATUS_DISABLED,
  BYOK_KEY_STATUS_ENABLED,
} from './types'

// Channel types the backend accepts for BYOK (bearer-key providers with an
// official single-key endpoint). Mirrors model/byok_key.go.
export const BYOK_CHANNEL_TYPE_OPTIONS = [
  { value: 1, label: 'OpenAI' },
  { value: 14, label: 'Claude' },
  { value: 24, label: 'Gemini' },
  { value: 25, label: 'Moonshot' },
  { value: 43, label: 'DeepSeek' },
  { value: 48, label: 'xAI' },
  { value: 40, label: 'SiliconFlow' },
] as const

export const BYOK_MODE_PRIORITIZED = 'prioritized'
export const BYOK_MODE_FALLBACK = 'fallback'

// Dedicated BYOK keys so the bare "Prioritized"/"Fallback" translations used
// by other dialogs stay untouched.
export const BYOK_MODE_OPTIONS = [
  { value: BYOK_MODE_PRIORITIZED, labelKey: 'BYOK Prioritized' },
  { value: BYOK_MODE_FALLBACK, labelKey: 'BYOK Fallback' },
] as const

export const BYOK_STATUS_OPTIONS = [
  {
    value: BYOK_KEY_STATUS_ENABLED,
    labelKey: 'Enabled',
    tone: 'success' as const,
  },
  {
    value: BYOK_KEY_STATUS_DISABLED,
    labelKey: 'Disabled',
    tone: 'danger' as const,
  },
] as const

export const SUCCESS_MESSAGES = {
  BYOK_KEY_CREATED: 'BYOK key created',
  BYOK_KEY_UPDATED: 'BYOK key updated',
  BYOK_KEY_DELETED: 'BYOK key deleted',
} as const

export const ERROR_MESSAGES = {
  LOAD_FAILED: 'Failed to load BYOK keys',
  UNEXPECTED: 'Unexpected error',
} as const
