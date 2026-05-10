import { createContext, useContext, useEffect, useState } from 'react'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'
import { generateThemeColors, applyThemeColors, removeThemeColors } from '@/lib/theme-color'
import { useTheme } from '@/context/theme-provider'

const THEME_COLOR_COOKIE_NAME = 'theme-color'
const THEME_COLOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

type ThemeColorProviderProps = {
  children: React.ReactNode
}

type ThemeColorProviderState = {
  hue: number | null
  setHue: (hue: number) => void
  resetHue: () => void
}

const initialState: ThemeColorProviderState = {
  hue: null,
  setHue: () => null,
  resetHue: () => null,
}

const ThemeColorContext = createContext<ThemeColorProviderState>(initialState)

export function ThemeColorProvider({ children }: ThemeColorProviderProps) {
  const [hue, _setHue] = useState<number | null>(() => {
    const stored = getCookie(THEME_COLOR_COOKIE_NAME)
    if (stored) {
      const parsed = Number(stored)
      if (!isNaN(parsed)) return parsed
    }
    return null
  })

  const { resolvedTheme } = useTheme()

  useEffect(() => {
    if (hue !== null) {
      const colors = generateThemeColors(hue)
      applyThemeColors(colors, resolvedTheme)
    }
  }, [hue, resolvedTheme])

  const setHue = (newHue: number) => {
    setCookie(THEME_COLOR_COOKIE_NAME, String(newHue), THEME_COLOR_COOKIE_MAX_AGE)
    _setHue(newHue)
    const colors = generateThemeColors(newHue)
    applyThemeColors(colors, resolvedTheme)
  }

  const resetHue = () => {
    removeCookie(THEME_COLOR_COOKIE_NAME)
    _setHue(null)
    removeThemeColors()
  }

  const contextValue = {
    hue,
    setHue,
    resetHue,
  }

  return (
    <ThemeColorContext value={contextValue}>
      {children}
    </ThemeColorContext>
  )
}

export const useThemeColor = () => {
  const context = useContext(ThemeColorContext)

  if (!context) throw new Error('useThemeColor must be used within a ThemeColorProvider')

  return context
}
