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
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { LanguageSwitcher } from '@/components/language-switcher'
import { NotificationPopover } from '@/components/notification-popover'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useNotifications } from '@/hooks/use-notifications'
import { useStatus } from '@/hooks/use-status'
import { useSystemConfig } from '@/hooks/use-system-config'
import { useAuthStore } from '@/stores/auth-store'

/**
 * Shared right-hand action group for every top bar.
 *
 * The item order is a global contract: search, notifications, language,
 * theme, account. Each top bar only toggles which items it needs, so the
 * sequence and sizing stay identical across public pages, the console,
 * error pages, and auth pages.
 *
 * Signed out, the account slot is a filled "Sign in" followed by an outlined
 * "Sign up"; the latter is hidden wherever registration is closed.
 */
type HeaderActionsProps = {
  /** Search entry. Requires a surrounding SearchProvider. */
  showSearch?: boolean
  showNotifications?: boolean
  showLanguageSwitcher?: boolean
  showThemeSwitch?: boolean
  /** Profile dropdown when signed in, otherwise a sign-in button. */
  showAuth?: boolean
}

export function HeaderActions(props: HeaderActionsProps) {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.auth.user)
  const { loading } = useSystemConfig()
  const notifications = useNotifications()
  const { status } = useStatus()
  // Fail closed while the registration status is unavailable: only show
  // Sign up once the status request has resolved with registration open.
  const registerEnabled =
    status !== null &&
    !status.self_use_mode_enabled &&
    status.register_enabled !== false

  let authEntry: React.ReactNode = null
  if (props.showAuth) {
    if (loading) {
      authEntry = <Skeleton className='h-8 w-20 rounded-lg' />
    } else if (user) {
      authEntry = <ProfileDropdown />
    } else {
      authEntry = (
        <>
          <Button
            size='sm'
            className='h-8 rounded-lg px-3.5 text-xs font-medium'
            render={<Link to='/sign-in' />}
          >
            {t('Sign in')}
          </Button>
          {registerEnabled && (
            <Button
              variant='outline'
              size='sm'
              className='border-foreground/35 hover:bg-muted/60 dark:border-foreground/30 h-8 rounded-lg bg-transparent px-3.5 text-xs font-medium dark:bg-transparent'
              render={<Link to='/sign-up' />}
            >
              {t('Sign up')}
            </Button>
          )}
        </>
      )
    }
  }

  return (
    <div className='flex items-center gap-1 sm:gap-2'>
      {props.showSearch && <Search />}
      {props.showNotifications && (
        <NotificationPopover
          open={notifications.popoverOpen}
          onOpenChange={notifications.setPopoverOpen}
          unreadCount={notifications.unreadCount}
          activeTab={notifications.activeTab}
          onTabChange={notifications.setActiveTab}
          notice={notifications.notice}
          announcements={notifications.announcements}
          loading={notifications.loading}
        />
      )}
      {props.showLanguageSwitcher && <LanguageSwitcher />}
      {props.showThemeSwitch && <ThemeSwitch />}
      {authEntry}
    </div>
  )
}
