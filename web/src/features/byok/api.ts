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
import { api } from '@/lib/api'

import type {
  ApiResponse,
  ByokKey,
  ByokKeyFormData,
  ByokStatus,
} from './types'

export async function getByokKeys(): Promise<ApiResponse<ByokKey[]>> {
  const res = await api.get('/api/user/byok')
  return res.data
}

export async function getByokStatus(): Promise<ApiResponse<ByokStatus>> {
  const res = await api.get('/api/user/byok/status')
  return res.data
}

export async function createByokKey(
  data: ByokKeyFormData
): Promise<ApiResponse<ByokKey>> {
  const res = await api.post('/api/user/byok', data)
  return res.data
}

export async function updateByokKey(
  id: number,
  data: ByokKeyFormData
): Promise<ApiResponse<ByokKey>> {
  const res = await api.put(`/api/user/byok/${id}`, data)
  return res.data
}

export async function deleteByokKey(id: number): Promise<ApiResponse> {
  const res = await api.delete(`/api/user/byok/${id}`)
  return res.data
}
