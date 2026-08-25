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
import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useStatus } from '@/hooks/use-status'

interface HeroProps {
  className?: string
  isAuthenticated?: boolean
}

/**
 * Editorial hero: oversized left-aligned display type, no background art.
 * The visual focus lives in the inverted showcase card below instead.
 */
export function Hero(props: HeroProps) {
  const { t } = useTranslation()
  const { status } = useStatus()
  const docsUrl =
    (status?.docs_link as string | undefined) || 'https://docs.newapi.pro'
  const docsIsExternal = docsUrl.startsWith('http')

  return (
    <section className='px-6 pt-24 md:pt-32 lg:pt-40'>
      <div className='mx-auto max-w-6xl'>
        <div className='max-w-3xl'>
          <p
            className='landing-animate-fade-up text-muted-foreground font-misans-regular text-xs font-medium tracking-[0.2em] uppercase opacity-0'
            style={{ animationDelay: '0ms' }}
          >
            {t('AI Application Infrastructure Foundation')}
          </p>

          <h1
            className='landing-animate-fade-up mt-6 text-5xl font-medium tracking-tight text-balance opacity-0 sm:text-6xl lg:text-7xl'
            style={{ animationDelay: '60ms' }}
          >
            {t('Unified API Gateway for')}
            <br />
            <span className='block mt-2'>{t('Vast Range of AI Models')}</span>
          </h1>

          <p
            className='landing-animate-fade-up text-muted-foreground font-misans-medium mt-6 max-w-xl text-lg leading-relaxed opacity-0 md:text-xl'
            style={{ animationDelay: '120ms' }}
          >
            {t(
              'Access a vast selection of models via a standard, unified API protocol. Power AI applications, manage digital assets, and connect the Future.'
            )}
          </p>

          <div
            className='landing-animate-fade-up mt-10 flex flex-wrap items-center gap-4 opacity-0'
            style={{ animationDelay: '180ms' }}
          >
            {props.isAuthenticated ? (
              <Link
                to='/dashboard'
                className='inline-flex h-11 items-center gap-1.5 rounded-full bg-neutral-950 px-6 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200'
              >
                {t('Go to Dashboard')}
                <ArrowRight className='size-4' />
              </Link>
            ) : (
              <>
                <Link
                  to='/sign-up'
                  className='inline-flex h-11 items-center gap-1.5 rounded-full bg-neutral-950 px-6 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200'
                >
                  {t('Get Started')}
                  <ArrowRight className='size-4' />
                </Link>
                <Link
                  to='/pricing'
                  className='ring-border hover:bg-muted/60 inline-flex h-11 items-center rounded-full px-6 text-sm font-semibold ring-1 transition-colors'
                >
                  {t('View Pricing')}
                </Link>
              </>
            )}
            {docsIsExternal ? (
              <a
                href={docsUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='text-muted-foreground hover:text-foreground inline-flex h-11 items-center gap-1 text-sm font-medium transition-colors'
              >
                {t('Docs')}
                <ArrowRight className='size-3.5' />
              </a>
            ) : (
              <Link
                to={docsUrl}
                className='text-muted-foreground hover:text-foreground inline-flex h-11 items-center gap-1 text-sm font-medium transition-colors'
              >
                {t('Docs')}
                <ArrowRight className='size-3.5' />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
