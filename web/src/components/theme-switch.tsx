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
import { Monitor, Moon, Sun } from 'lucide-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { useTheme } from '@/context/theme-provider'

const NEXT_THEME = {
  light: 'dark',
  dark: 'system',
  system: 'light',
} as const

// Keys are translated at render time via t(); the literals exist in the
// locale files (also used by the theme quick switcher and config drawer).
const THEME_LABEL_KEYS = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
} as const

export function ThemeSwitch() {
  const { t } = useTranslation()
  const { theme, resolvedTheme, setTheme } = useTheme()

  /* Update theme-color meta tag
   * when the resolved theme is updated */
  useEffect(() => {
    const themeColor = resolvedTheme === 'dark' ? '#020817' : '#fff'
    const metaThemeColor = document.querySelector("meta[name='theme-color']")
    if (metaThemeColor) metaThemeColor.setAttribute('content', themeColor)
  }, [resolvedTheme])

  const themeLabel = t(THEME_LABEL_KEYS[theme])

  return (
    <Button
      variant='ghost'
      size='icon'
      className='h-9 w-9'
      onClick={() => setTheme(NEXT_THEME[theme])}
      aria-label={`${t('Toggle theme')}: ${themeLabel}`}
      title={`${t('Theme')}: ${themeLabel}`}
    >
      {theme === 'light' && <Sun className='size-[1.2rem]' />}
      {theme === 'dark' && <Moon className='size-[1.2rem]' />}
      {theme === 'system' && <Monitor className='size-[1.2rem]' />}
    </Button>
  )
}
