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
import { useCallback, useEffect, useState } from 'react'

/**
 * Track which in-page section is currently active while scrolling.
 * Sections register via `id` attributes; clicking a nav item smooth-scrolls
 * to it. Mirrors the sticky sidebar navigation on openrouter.ai/benchmarks.
 */
export function useScrollSpy(ids: string[]) {
  const key = ids.join('|')
  const [activeId, setActiveId] = useState<string | null>(ids[0] ?? null)

  useEffect(() => {
    const idList = key.split('|').filter(Boolean)
    if (idList.length === 0) return

    const visible = new Map<string, number>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visible.set(
            entry.target.id,
            entry.isIntersecting ? entry.intersectionRatio : 0
          )
        }
        for (const id of idList) {
          if ((visible.get(id) ?? 0) > 0) {
            setActiveId(id)
            return
          }
        }
      },
      // Only the horizontal band just below the sticky header counts as
      // "current", so the highlight tracks the section being read.
      { rootMargin: '-96px 0px -60% 0px', threshold: [0, 0.1, 0.5] }
    )
    for (const id of idList) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [key])

  const scrollTo = useCallback((id: string) => {
    setActiveId(id)
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return { activeId, scrollTo }
}
