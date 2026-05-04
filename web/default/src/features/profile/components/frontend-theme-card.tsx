import { useState } from 'react'
import { MonitorSmartphone } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TitledCard } from '@/components/ui/titled-card'
import {
  getFrontendTheme,
  getFrontendThemeSettingsPath,
  normalizeFrontendTheme,
  setFrontendTheme,
  type FrontendTheme,
} from '@/lib/frontend-theme'
import { updateFrontendTheme } from '../api'
import { parseUserSettings } from '../lib'

const FRONTEND_THEME_OPTIONS: Array<{
  value: FrontendTheme
  label: string
}> = [
  { value: 'default', label: 'New UI' },
  { value: 'classic', label: 'Classic UI' },
]

export function FrontendThemeCard() {
  const { t } = useTranslation()
  const { auth } = useAuthStore()
  const [currentTheme, setCurrentTheme] = useState<FrontendTheme>(
    getFrontendTheme()
  )
  const [switching, setSwitching] = useState(false)

  const handleThemeChange = async (value: string) => {
    const nextTheme = normalizeFrontendTheme(value)
    if (nextTheme === currentTheme) return

    setSwitching(true)
    try {
      const existingSetting =
        typeof auth.user?.setting === 'string'
          ? parseUserSettings(auth.user.setting)
          : (auth.user?.setting ?? {})
      const response = await updateFrontendTheme(nextTheme)

      if (!response.success) {
        throw new Error(response.message || t('Failed to update settings'))
      }

      setFrontendTheme(nextTheme)
      setCurrentTheme(nextTheme)

      if (auth.user) {
        useAuthStore.getState().auth.setUser({
          ...auth.user,
          setting: JSON.stringify({
            ...existingSetting,
            frontend_theme: nextTheme,
          }),
        })
      }

      toast.success(t('Interface style updated. Redirecting...'))
      window.setTimeout(() => {
        window.location.assign(getFrontendThemeSettingsPath(nextTheme))
      }, 300)
    } catch {
      toast.error(t('Failed to update settings'))
    } finally {
      setSwitching(false)
    }
  }

  return (
    <TitledCard
      title={t('Interface Style')}
      description={t(
        'Switch between the new UI and the classic UI. The page will refresh immediately after saving.'
      )}
      icon={<MonitorSmartphone className='h-4 w-4' />}
    >
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4'>
        <div className='space-y-1'>
          <div className='text-sm font-medium'>{t('UI Style')}</div>
          <p className='text-muted-foreground line-clamp-2 text-xs sm:text-sm'>
            {t('Choose between the new interface and the classic interface.')}
          </p>
        </div>
        <div className='sm:min-w-48'>
          <Select
            value={currentTheme}
            onValueChange={handleThemeChange}
            disabled={switching}
          >
            <SelectTrigger className='w-full sm:w-48'>
              <SelectValue placeholder={t('Select interface style')} />
            </SelectTrigger>
            <SelectContent>
              {FRONTEND_THEME_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {t(option.label)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </TitledCard>
  )
}
