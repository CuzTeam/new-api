import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { SectionPageLayout } from '@/components/layout'
import { getAvailabilityStats } from './api'
import { AvailabilityTable } from './components/availability-table'

export function Availability() {
  const { t } = useTranslation()

  const { data, isLoading, error } = useQuery({
    queryKey: ['availability'],
    queryFn: () => getAvailabilityStats(),
  })

  return (
    <SectionPageLayout>
      <SectionPageLayout.Title>{t('Availability Status Monitor')}</SectionPageLayout.Title>
      <SectionPageLayout.Description>
        {t('Monitor model availability across channels')}
      </SectionPageLayout.Description>
      <SectionPageLayout.Content>
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
      </SectionPageLayout.Content>
    </SectionPageLayout>
  )
}
