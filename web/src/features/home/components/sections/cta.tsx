/*
Copyright (C) 2023-2026 QuantumNous
Modifications Copyright (C) 2026 Cuz Technology

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

import { AnimateInView } from '@/components/animate-in-view'

interface CTAProps {
  className?: string
  isAuthenticated?: boolean
}

/**
 * Closing inverted panel, echoing the showcase card above: white display
 * type on near-black, one inverted pill button.
 */
export function CTA(props: CTAProps) {
  const { t } = useTranslation()

  if (props.isAuthenticated) {
    return null
  }

  return (
    <section className='px-6'>
      <div className='mx-auto mt-24 mb-20 max-w-6xl sm:mt-32 sm:mb-28 lg:mt-40'>
        <AnimateInView
          className='rounded-[2.5rem] bg-neutral-950 px-6 py-20 sm:py-24 md:px-14 dark:bg-[#151515] dark:ring-1 dark:ring-white/10'
          animation='fade-up'
        >
          <div className='max-w-xl'>
            <h2 className='text-3xl font-medium tracking-tight text-balance text-white sm:text-4xl'>
              {t('Ready to simplify')} {t('your AI integration?')}
            </h2>
            <p className='mt-5 text-base leading-relaxed text-neutral-400'>
              {t(
                'Deploy your own gateway and start routing requests through your configured upstream services.'
              )}
            </p>
            <div className='mt-8 flex flex-wrap items-center gap-4'>
              <Link
                to='/sign-up'
                className='inline-flex h-11 items-center gap-1.5 rounded-full bg-white px-6 text-sm font-semibold text-neutral-950 transition-colors hover:bg-neutral-200'
              >
                {t('Get Started')}
                <ArrowRight className='size-4' />
              </Link>
              <Link
                to='/pricing'
                className='inline-flex h-11 items-center rounded-full px-6 text-sm font-semibold text-white ring-1 ring-white/20 transition-colors hover:bg-white/10'
              >
                {t('View Pricing')}
              </Link>
            </div>
          </div>
        </AnimateInView>
      </div>
    </section>
  )
}
