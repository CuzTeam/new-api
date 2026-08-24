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
import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

export type SideNavItem = {
  id: string
  label: string
  icon?: LucideIcon
}

type BenchmarksSideNavProps = {
  items: SideNavItem[]
  activeId: string | null
  onSelect: (id: string) => void
}

/**
 * Sticky in-page navigation with scroll-spy highlighting, as on
 * openrouter.ai/benchmarks. Hidden below the `lg` breakpoint, where the
 * sections simply stack vertically.
 */
export function BenchmarksSideNav(props: BenchmarksSideNavProps) {
  return (
    <nav
      aria-label='Page sections'
      className='sticky top-24 hidden w-52 shrink-0 self-start lg:block'
    >
      <ul className='space-y-1'>
        {props.items.map((item) => {
          const Icon = item.icon
          const active = props.activeId === item.id
          return (
            <li key={item.id}>
              <button
                type='button'
                aria-current={active ? 'true' : undefined}
                onClick={() => props.onSelect(item.id)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                  active
                    ? 'bg-accent text-primary font-medium'
                    : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                )}
              >
                {Icon && <Icon aria-hidden className='size-4 shrink-0' />}
                <span className='truncate'>{item.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
