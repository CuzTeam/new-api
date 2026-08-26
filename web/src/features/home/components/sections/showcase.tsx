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
 * Showcase card: the live API terminal on a grainy gradient panel —
 * the visual anchor of the landing page.
 *
 * On scroll, the background grain scales up while the terminal card stays fixed.
 */
export function Showcase(_props: ShowcaseProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }
    const section = sectionRef.current
    const bg = bgRef.current
    if (!section || !bg) {
      return
    }

    const ctx = gsap.context(() => {
      gsap.to(bg, {
        scale: () =>
          Math.max(
            window.innerWidth / bg.offsetWidth,
            window.innerHeight / bg.offsetHeight
          ),
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
        <div className='relative overflow-hidden rounded-[2.5rem] bg-background px-6 py-16 ring-1 ring-border sm:px-10 sm:py-20 lg:px-14'>
          <div ref={bgRef} className='absolute inset-0'>
            <GrainField />
          </div>
          <HeroTerminalDemo className='relative' />
        </div>
      </div>
    </section>
  )
}
