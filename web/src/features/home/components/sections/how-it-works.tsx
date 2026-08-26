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
import { useTranslation } from 'react-i18next'

import { AnimateInView } from '@/components/animate-in-view'

/**
 * Numbered steps in the same editorial voice: mono numerals, hairline tops,
 * left-aligned — no icon boxes.
 */
export function HowItWorks() {
  const { t } = useTranslation()

  const steps = [
    {
      num: '01',
      title: t('Configure'),
      desc: t(
        'Add your API keys, set up channels and configure access permissions'
      ),
    },
    {
      num: '02',
      title: t('Connect'),
      desc: t(
        'Connect through OpenAI, Claude, Gemini, and other compatible API routes'
      ),
    },
    {
      num: '03',
      title: t('Monitor'),
      desc: t('Track usage, costs and performance with real-time analytics'),
    },
  ]

  return (
    <section className='px-6'>
      <div className='mx-auto mt-24 max-w-6xl sm:mt-32 lg:mt-40'>
        <AnimateInView className='max-w-2xl'>
          <p className='text-muted-foreground font-misans-regular text-xs font-medium tracking-[0.2em] uppercase'>
            {t('How It Works')}
          </p>
          <h2 className='font-misans-medium mt-4 text-3xl font-medium tracking-tight text-balance sm:text-4xl'>
            {t('Three steps to get started')}
          </h2>
        </AnimateInView>

        <div className='mt-14 grid gap-10 md:grid-cols-3 md:gap-12'>
          {steps.map((step, i) => (
            <AnimateInView
              key={step.num}
              delay={i * 100}
              animation='fade-up'
              className='border-border/60 border-t pt-7'
            >
              <span className='text-muted-foreground font-misans-regular text-sm tabular-nums'>
                {step.num}
              </span>
              <h3 className='font-misans-medium mt-4 text-lg font-semibold'>{step.title}</h3>
              <p className='text-muted-foreground font-misans-regular mt-2 text-sm leading-relaxed'>
                {step.desc}
              </p>
            </AnimateInView>
          ))}
        </div>
      </div>
    </section>
  )
}
