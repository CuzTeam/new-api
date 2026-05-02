import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useStatus } from '@/hooks/use-status'
import { Availability } from '@/features/availability'

function AvailabilityPage() {
  const { status } = useStatus()

  if (status && !status.availability_enabled) {
    return <Navigate to='/403' />
  }

  return <Availability />
}

export const Route = createFileRoute('/_authenticated/availability/')({
  component: AvailabilityPage,
})
