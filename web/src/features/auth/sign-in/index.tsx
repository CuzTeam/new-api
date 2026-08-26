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
import { Link, useSearch } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { useStatus } from '@/hooks/use-status'

import { AuthLayout } from '../auth-layout'
import { TermsFooter } from '../components/terms-footer'
import { UserAuthForm } from './components/user-auth-form'

export function SignIn() {
  const { t } = useTranslation()
  const { redirect } = useSearch({ from: '/(auth)/sign-in' })
  const { status } = useStatus()

  return (
    <AuthLayout>
      <div className='w-full space-y-8'>
        {/* Title doubles as the switch between the two auth pages; both words
            live in the same heading so their type can never drift apart. */}
        <h2 className='flex items-baseline justify-center gap-5 text-2xl font-semibold tracking-tight sm:justify-start'>
          <span>{t('Sign in')}</span>
          {/* Fail closed while the registration status is unavailable. */}
          {status !== null &&
            !status.self_use_mode_enabled &&
            status.register_enabled !== false && (
              <Link
                to='/sign-up'
                className='text-muted-foreground hover:text-foreground transition-colors'
              >
                {t('Sign up')}
              </Link>
            )}
        </h2>

        <UserAuthForm redirectTo={redirect} />

        <TermsFooter
          variant='sign-in'
          status={status}
          className='text-center'
        />
      </div>
    </AuthLayout>
  )
}
