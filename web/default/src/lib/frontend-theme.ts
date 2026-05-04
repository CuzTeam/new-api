import { getCookie, setCookie } from '@/lib/cookies'

export const FRONTEND_THEME_COOKIE_NAME = 'frontend_theme'
export const FRONTEND_THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export type FrontendTheme = 'default' | 'classic'

export function normalizeFrontendTheme(
  value?: string | null
): FrontendTheme {
  if (value === 'classic') {
    return 'classic'
  }
  return 'default'
}

export function getFrontendTheme(): FrontendTheme {
  return normalizeFrontendTheme(getCookie(FRONTEND_THEME_COOKIE_NAME))
}

export function setFrontendTheme(theme: FrontendTheme): void {
  setCookie(FRONTEND_THEME_COOKIE_NAME, theme, FRONTEND_THEME_COOKIE_MAX_AGE)
}

export function getFrontendThemeSettingsPath(theme: FrontendTheme): string {
  return theme === 'classic' ? '/console/personal' : '/profile'
}
