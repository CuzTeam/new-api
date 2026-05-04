import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Save } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { getChannels } from '@/features/channels/api'
import { SettingsSection } from '../components/settings-section'
import { useUpdateOption } from '../hooks/use-update-option'

type AvailabilitySectionProps = {
  enabled: boolean
  data: string
}

export function AvailabilitySection({ enabled, data }: AvailabilitySectionProps) {
  const { t } = useTranslation()
  const updateOption = useUpdateOption()
  const [isEnabled, setIsEnabled] = useState(enabled)
  const [hiddenChannelIds, setHiddenChannelIds] = useState<number[]>(() => {
    try {
      return JSON.parse(data || '[]')
    } catch {
      return []
    }
  })
  const [hasChanges, setHasChanges] = useState(false)
  const [search, setSearch] = useState('')

  const { data: channelsResponse } = useQuery({
    queryKey: ['channels-for-availability'],
    queryFn: () => getChannels({ page_size: 1000 }),
    enabled: isEnabled,
  })

  const channels = channelsResponse?.data?.items ?? []

  const filteredChannels = search
    ? channels.filter(
        (ch) =>
          ch.name.toLowerCase().includes(search.toLowerCase()) ||
          String(ch.id).includes(search)
      )
    : channels

  useEffect(() => {
    setIsEnabled(enabled)
  }, [enabled])

  useEffect(() => {
    try {
      setHiddenChannelIds(JSON.parse(data || '[]'))
    } catch {
      setHiddenChannelIds([])
    }
  }, [data])

  const handleToggleEnabled = async (checked: boolean) => {
    try {
      await updateOption.mutateAsync({
        key: 'console_setting.availability_enabled',
        value: checked,
      })
      setIsEnabled(checked)
      toast.success(t('Setting saved'))
    } catch {
      toast.error(t('Failed to update setting'))
    }
  }

  const handleToggleChannel = (channelId: number, checked: boolean) => {
    const newIds = checked
      ? [...hiddenChannelIds, channelId]
      : hiddenChannelIds.filter((id) => id !== channelId)
    setHiddenChannelIds(newIds)
    setHasChanges(true)
  }

  const handleSave = async () => {
    try {
      await updateOption.mutateAsync({
        key: 'console_setting.availability_hidden_channels',
        value: JSON.stringify(hiddenChannelIds),
      })
      setHasChanges(false)
      toast.success(t('Availability settings saved successfully'))
    } catch {
      toast.error(t('Failed to save availability settings'))
    }
  }

  return (
    <SettingsSection
      title={t('Availability Panel')}
      description={t(
        'Configure availability monitoring panel for the dashboard'
      )}
    >
      <div className='space-y-4'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div className='flex flex-wrap items-center gap-2'>
            <Button
              onClick={handleSave}
              size='sm'
              variant='secondary'
              disabled={!hasChanges || updateOption.isPending}
            >
              <Save className='mr-2 h-4 w-4' />
              {updateOption.isPending ? t('Saving...') : t('Save Settings')}
            </Button>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-muted-foreground text-sm'>
              {t('Enabled')}
            </span>
            <Switch checked={isEnabled} onCheckedChange={handleToggleEnabled} />
          </div>
        </div>

        {isEnabled && (
          <div className='space-y-3'>
            <div className='text-muted-foreground text-sm'>
              {t(
                'Select channels to hide from the availability panel. Checked channels will be hidden.'
              )}
            </div>

            <Input
              placeholder={t('Search channels...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='max-w-sm'
            />

            <div className='rounded-md border'>
              <div className='max-h-80 overflow-y-auto'>
                {filteredChannels.length === 0 ? (
                  <div className='text-muted-foreground flex h-24 items-center justify-center text-sm'>
                    {channels.length === 0
                      ? t('No channels found.')
                      : t('No channels match your search.')}
                  </div>
                ) : (
                  <div className='divide-y'>
                    {filteredChannels.map((channel) => (
                      <label
                        key={channel.id}
                        className='hover:bg-muted/50 flex cursor-pointer items-center gap-3 px-4 py-2.5'
                      >
                        <Checkbox
                          checked={hiddenChannelIds.includes(channel.id)}
                          onCheckedChange={(checked) =>
                            handleToggleChannel(channel.id, checked as boolean)
                          }
                        />
                        <span className='text-sm font-medium'>
                          {channel.name}
                        </span>
                        <span className='text-muted-foreground text-xs'>
                          ID: {channel.id}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {hiddenChannelIds.length > 0 && (
              <div className='text-muted-foreground text-sm'>
                {t('{{count}} channels hidden', {
                  count: hiddenChannelIds.length,
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </SettingsSection>
  )
}
