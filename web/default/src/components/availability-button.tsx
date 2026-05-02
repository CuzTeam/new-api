import { ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useStatus } from '@/hooks/use-status'
import { getAvailabilityStats } from '@/features/availability/api'
import { AvailabilityTable } from '@/features/availability/components/availability-table'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function AvailabilityButton({ className }: { className?: string }) {
  const { t } = useTranslation()
  const { status } = useStatus()
  const [open, setOpen] = useState(false)

  const enabled = status?.availability_enabled === true

  const { data, isLoading, error } = useQuery({
    queryKey: ['availability'],
    queryFn: () => getAvailabilityStats(),
    enabled: open,
  })

  if (!enabled) return null

  return (
    <>
      <Button
        variant='ghost'
        size='icon'
        onClick={() => setOpen(true)}
        className={className ?? 'h-9 w-9 rounded-full'}
        aria-label={t('Availability Monitor')}
      >
        <ShieldCheck className='size-[1.2rem]' />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='sm:max-w-3xl max-h-[80vh] overflow-auto'>
          <DialogHeader>
            <DialogTitle>{t('Availability Status Monitor')}</DialogTitle>
            <DialogDescription>
              {t('Monitor model availability across channels')}
            </DialogDescription>
          </DialogHeader>
          {isLoading ? (
            <div className='flex items-center justify-center py-12'>
              <div className='text-muted-foreground'>{t('Loading...')}</div>
            </div>
          ) : error ? (
            <div className='flex items-center justify-center py-12'>
              <div className='text-destructive'>{t('Failed to load data')}</div>
            </div>
          ) : (
            <AvailabilityTable data={data ?? []} />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
