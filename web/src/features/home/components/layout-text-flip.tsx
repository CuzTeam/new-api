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
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

interface LayoutTextFlipProps {
  words: string[]
  duration?: number
  className?: string
}

/**
 * Rotating headline chip: words slide in with a blur and the pill
 * layout-animates its width to hug each word.
 */
export function LayoutTextFlip({
  words,
  duration = 3000,
  className,
}: LayoutTextFlipProps) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((current) => (current + 1) % words.length)
    }, duration)

    return () => clearInterval(interval)
  }, [duration, words.length])

  return (
    <motion.span
      layout
      className={cn(
        'relative inline-block w-fit overflow-hidden rounded-2xl bg-neutral-950 px-5 py-1 text-white shadow-sm ring-1 ring-black/10 dark:bg-white dark:text-neutral-950 dark:ring-white/10',
        className
      )}
    >
      <AnimatePresence mode='popLayout'>
        <motion.span
          key={index}
          initial={{ y: '-60%', filter: 'blur(10px)' }}
          animate={{ y: 0, filter: 'blur(0px)' }}
          exit={{ y: '70%', filter: 'blur(10px)', opacity: 0 }}
          transition={{ duration: 0.5 }}
          className='inline-block whitespace-nowrap'
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  )
}
