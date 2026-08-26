/*
Copyright (C) 2026 Cuz Technology

This file is part of New API. New API is free software: you can
redistribute it and/or modify it under the terms of the GNU Affero
General Public License as published by the Free Software Foundation,
either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.
*/
import { useLayoutEffect, useRef } from 'react'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { GrainField } from '../grain-field'
import { HeroTerminalDemo } from '../hero-terminal-demo'

gsap.registerPlugin(ScrollTrigger)

interface ShowcaseProps {
  className?: string
}

/**
 * Inverted showcase card: the live API terminal on a grainy gradient panel —
 * the visual anchor of the landing page. The `dark` class forces dark-variant
 * rendering of the terminal even when the site is in light mode.
 *
 * On scroll, the section pins to the viewport and the card scales up until it
 * covers the whole screen (scrubbed); releasing the pin resumes normal flow.
 */
export function Showcase(_props: ShowcaseProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }
    const section = sectionRef.current
    const card = cardRef.current
    if (!section || !card) {
      return
    }

    const ctx = gsap.context(() => {
      gsap.to(card, {
        // Grow until the card covers the viewport in both axes.
        scale: () =>
          Math.max(
            window.innerWidth / card.offsetWidth,
            window.innerHeight / card.offsetHeight
          ),
        // Keep the card centered on the viewport even when the section is
        // taller than one screen (small viewports).
        y: () => {
          const cardRect = card.getBoundingClientRect()
          const sectionRect = section.getBoundingClientRect()
          const cardCenter = cardRect.top - sectionRect.top + cardRect.height / 2
          return window.innerHeight / 2 - cardCenter
        },
        borderRadius: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=100%',
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className='flex min-h-svh items-center px-6'>
      <div className='mx-auto w-full max-w-6xl'>
        <div
          ref={cardRef}
          className='dark relative overflow-hidden rounded-[2.5rem] bg-neutral-950 px-6 py-16 sm:px-10 sm:py-20 lg:px-14 dark:bg-[#151515] dark:ring-1 dark:ring-white/10'
        >
          <GrainField />
          <HeroTerminalDemo className='relative' />
        </div>
      </div>
    </section>
  )
}
