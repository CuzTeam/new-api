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
import { useQuery } from '@tanstack/react-query'
import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'

import { useStatus } from '@/hooks/use-status'
import { useSystemConfig } from '@/hooks/use-system-config'
import { cn } from '@/lib/utils'

const PROJECT_REPOSITORY_URL = 'https://github.com/CuzTeam/new-api'
const HITOKOTO_API_URL = 'https://v1.hitokoto.cn/'
const HITOKOTO_FALLBACK_QUOTE = '人是要整活的——没活了，可不就是死了么？'

interface FooterProps {
  className?: string
}

/**
 * Fetches a random quote from the Hitokoto API (https://v1.hitokoto.cn/).
 * Falls back to a fixed quote while loading or when the request fails so the
 * footer always renders a sentence.
 */
function useHitokoto(): string {
  const { data } = useQuery({
    queryKey: ['hitokoto'],
    queryFn: async () => {
      const response = await fetch(HITOKOTO_API_URL)
      if (!response.ok) {
        throw new Error(`Hitokoto request failed: ${response.status}`)
      }
      const payload: unknown = await response.json()
      const sentence = (payload as { hitokoto?: unknown } | null)?.hitokoto
      if (typeof sentence !== 'string' || sentence.trim().length === 0) {
        throw new Error('Hitokoto response missing sentence')
      }
      return sentence
    },
    // Fail fast to the fallback quote instead of retrying an external service.
    retry: false,
    placeholderData: HITOKOTO_FALLBACK_QUOTE,
  })
  return data || HITOKOTO_FALLBACK_QUOTE
}

// Renders User Agreement / Privacy Policy links inline with the parent's
// credit row when either is configured in System Settings → Site. Emits
// fragmented siblings so the parent flex container's gap controls spacing.
function LegalLinks(props: { leadingSeparator?: boolean }) {
  const { t } = useTranslation()
  const { status } = useStatus()
  const items: { key: string; label: string; href: string }[] = []
  if (status?.user_agreement_enabled) {
    items.push({
      key: 'user-agreement',
      label: t('User Agreement'),
      href: '/user-agreement',
    })
  }
  if (status?.privacy_policy_enabled) {
    items.push({
      key: 'privacy-policy',
      label: t('Privacy Policy'),
      href: '/privacy-policy',
    })
  }
  if (items.length === 0) {
    return null
  }
  return (
    <>
      {items.map((item, index) => (
        <Fragment key={item.key}>
          {(props.leadingSeparator || index > 0) && (
            <span aria-hidden='true' className='text-muted-foreground/30'>
              ·
            </span>
          )}
          <Link
            to={item.href}
            className='hover:text-foreground transition-colors duration-200'
          >
            {item.label}
          </Link>
        </Fragment>
      ))}
    </>
  )
}

export function Footer(props: FooterProps) {
  const { t } = useTranslation()
  const { systemName, footerHtml } = useSystemConfig()
  const { status } = useStatus()
  const quote = useHitokoto()

  const displayName = systemName || 'New API'
  const version =
    typeof status?.version === 'string' ? status.version.trim() : ''

  return (
    <footer
      className={cn('border-border/40 relative z-10 border-t', props.className)}
    >
      <div className='mx-auto flex w-full max-w-6xl flex-col items-center gap-8 px-6 py-14 text-center'>
        {/* Custom area: free-form HTML configured in System Settings → Site,
            rendered unwrapped at the top of the footer. */}
        {footerHtml && (
          <div
            className='custom-footer text-muted-foreground w-full text-sm'
            dangerouslySetInnerHTML={{ __html: footerHtml }}
          />
        )}

        {/* Hitokoto quote, refreshed from the API on every visit. */}
        <p className='text-foreground/90 max-w-2xl text-base leading-relaxed font-medium sm:text-lg'>
          {quote}
        </p>

        {/* Site name (commit hash) | Open Source Software — all links point
            to the project repository. */}
        <p className='text-foreground/80 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm font-medium sm:text-base'>
          <a
            href={PROJECT_REPOSITORY_URL}
            target='_blank'
            rel='noopener noreferrer'
            className='hover:text-foreground transition-colors duration-200'
          >
            {displayName}
          </a>
          {version && (
            <a
              href={PROJECT_REPOSITORY_URL}
              target='_blank'
              rel='noopener noreferrer'
              className='text-muted-foreground hover:text-foreground transition-colors duration-200'
            >
              ({version})
            </a>
          )}
          <span aria-hidden='true' className='text-muted-foreground/40'>
            |
          </span>
          <a
            href={PROJECT_REPOSITORY_URL}
            target='_blank'
            rel='noopener noreferrer'
            className='hover:text-foreground transition-colors duration-200'
          >
            {t('Open Source Software')}
          </a>
        </p>

        {/* Credit row with optional legal links. */}
        <p className='text-muted-foreground/50 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs'>
          <span>{t('Design by New-API & Cuz Technology,')}</span>
          <LegalLinks leadingSeparator />
        </p>
      </div>
    </footer>
  )
}
