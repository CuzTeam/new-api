import { createFileRoute, redirect } from '@tanstack/react-router'
import { useStatus } from '@/hooks/use-status'
import { Availability } from '@/features/availability'

function AvailabilityPage() {
  const { status } = useStatus()

  if (status && !status.availability_enabled) {
    throw redirect({ to: '/403' })
  }

  return <Availability />
}

export const Route = createFileRoute('/_authenticated/availability/')({
  component: AvailabilityPage,
})
