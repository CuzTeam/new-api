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
import { GrainField } from '../grain-field'
import { HeroTerminalDemo } from '../hero-terminal-demo'

interface ShowcaseProps {
  className?: string
}

/**
 * Inverted showcase card: the live API terminal on a grainy gradient panel —
 * the visual anchor of the landing page. The `dark` class forces dark-variant
 * rendering of the terminal even when the site is in light mode.
 */
export function Showcase(_props: ShowcaseProps) {
  return (
    <section className='px-6'>
      <div className='mx-auto mt-20 max-w-6xl md:mt-28'>
        <div className='dark relative overflow-hidden rounded-[2.5rem] bg-neutral-950 px-6 py-16 sm:px-10 sm:py-20 lg:px-14 dark:bg-[#151515] dark:ring-1 dark:ring-white/10'>
          <GrainField />
          <HeroTerminalDemo className='relative' />
        </div>
      </div>
    </section>
  )
}
