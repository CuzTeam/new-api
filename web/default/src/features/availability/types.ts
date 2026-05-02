export interface ChannelAvailability {
  channel_id: number
  channel_name: string
  total: number
  success: number
}

export interface ModelAvailability {
  model_name: string
  channels: ChannelAvailability[]
  total_requests: number
  success_requests: number
  availability: number
}
