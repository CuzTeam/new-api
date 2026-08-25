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
import {
  Code,
  DollarSign,
  Gauge,
  Globe,
  HeartHandshake,
  Shield,
  Users,
  Zap,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { AnimateInView } from '@/components/animate-in-view'

interface FeaturesProps {
  className?: string
}

/**
 * Editorial feature list: hairline-ruled grid, monochrome icons, no cards.
 */
export function Features(_props: FeaturesProps) {
  const { t } = useTranslation()

  const features = [
    {
      icon: Zap,
      title: t('Lightning Fast'),
      desc: t(
        'Optimized network architecture ensures millisecond response times'
      ),
    },
    {
      icon: Shield,
      title: t('Secure & Reliable'),
      desc: t(
        'Enterprise-grade security with comprehensive permission management'
      ),
    },
    {
      icon: Globe,
      title: t('Global Coverage'),
      desc: t('Multi-region deployment for stable global access'),
    },
    {
      icon: Code,
      title: t('Developer Friendly'),
      desc: t('Compatible API routes for common AI application workflows'),
    },
    {
      icon: Gauge,
      title: t('High Performance'),
      desc: t('Support for high concurrency with automatic load balancing'),
    },
    {
      icon: DollarSign,
      title: t('Transparent Billing'),
      desc: t('Pay-as-you-go with real-time usage monitoring'),
    },
    {
      icon: Users,
      title: t('Team Collaboration'),
      desc: t('Multi-user management with flexible permission allocation'),
    },
    {
      icon: HeartHandshake,
      title: t('Open Source'),
      desc: t('Community driven, self-hosted, and extensible'),
    },
  ]

  return (
    <section className='px-6'>
      <div className='mx-auto mt-24 max-w-6xl sm:mt-32 lg:mt-40'>
        <AnimateInView className='max-w-2xl'>
          <p className='text-muted-foreground font-misans-regular text-xs font-medium tracking-[0.2em] uppercase'>
            {t('Core Features')}
          </p>
          <h2 className='font-misans-medium mt-4 text-3xl font-medium tracking-tight text-balance sm:text-4xl'>
            {t('Built for developers,')} {t('designed for scale')}
          </h2>
        </AnimateInView>

        <div className='mt-14 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4'>
          {features.map((f, i) => (
            <AnimateInView
              key={f.title}
              delay={i * 60}
              animation='fade-up'
              className='border-border/60 border-t pt-7'
            >
              <f.icon
                className='text-muted-foreground size-5'
                strokeWidth={1.5}
              />
              <h3 className='font-misans-medium mt-4 text-base font-semibold'>{f.title}</h3>
              <p className='text-muted-foreground font-misans-regular mt-2 text-sm leading-relaxed'>
                {f.desc}
              </p>
            </AnimateInView>
          ))}
        </div>
      </div>
    </section>
  )
}
