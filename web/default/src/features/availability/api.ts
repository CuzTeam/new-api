import { api } from '@/lib/api'
import type { ModelAvailability } from './types'

export async function getAvailabilityStats(
  startTimestamp?: number,
  endTimestamp?: number
): Promise<ModelAvailability[]> {
  const params: Record<string, string> = {}
  if (startTimestamp) params.start_timestamp = String(startTimestamp)
  if (endTimestamp) params.end_timestamp = String(endTimestamp)

  const res = await api.get<{ success: boolean; data: ModelAvailability[] }>(
    '/api/log/availability',
    { params }
  )
  return Array.isArray(res.data.data) ? res.data.data : []
}
