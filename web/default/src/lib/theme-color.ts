export const PRESET_HUES = [
  { name: 'Blue', hue: 265 },
  { name: 'Indigo', hue: 240 },
  { name: 'Violet', hue: 290 },
  { name: 'Purple', hue: 310 },
  { name: 'Rose', hue: 350 },
  { name: 'Orange', hue: 30 },
  { name: 'Green', hue: 155 },
  { name: 'Teal', hue: 185 },
]

export const DEFAULT_HUE = 265

const THEME_VARIABLES = [
  '--primary',
  '--primary-foreground',
  '--ring',
] as const

function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

function linearToSrgb(c: number): number {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055
}

function hexToSrgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16) / 255
  const g = parseInt(h.substring(2, 4), 16) / 255
  const b = parseInt(h.substring(4, 6), 16) / 255
  return [r, g, b]
}

function srgbToOklab(r: number, g: number, b: number): [number, number, number] {
  const lr = srgbToLinear(r)
  const lg = srgbToLinear(g)
  const lb = srgbToLinear(b)

  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb

  const l_ = Math.cbrt(l)
  const m_ = Math.cbrt(m)
  const s_ = Math.cbrt(s)

  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_
  const ob = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_

  return [L, a, ob]
}

function oklabToSrgb(L: number, a: number, b: number): [number, number, number] {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b

  const l = l_ * l_ * l_
  const m = m_ * m_ * m_
  const s = s_ * s_ * s_

  const r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
  const ob = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s

  return [
    Math.max(0, Math.min(1, linearToSrgb(r))),
    Math.max(0, Math.min(1, linearToSrgb(g))),
    Math.max(0, Math.min(1, linearToSrgb(ob))),
  ]
}

export function hexToHue(hex: string): number {
  const [r, g, b] = hexToSrgb(hex)
  const [, a, ob] = srgbToOklab(r, g, b)
  let hue = (Math.atan2(ob, a) * 180) / Math.PI
  if (hue < 0) hue += 360
  return hue
}

export function hueToHex(hue: number): string {
  const L = 0.55
  const C = 0.15
  const rad = (hue * Math.PI) / 180
  const a = C * Math.cos(rad)
  const b = C * Math.sin(rad)
  const [r, g, bl] = oklabToSrgb(L, a, b)
  const toHex = (c: number) => Math.round(c * 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(bl)}`
}

export type ThemeColors = {
  light: Record<string, string>
  dark: Record<string, string>
}

export function generateThemeColors(hue: number): ThemeColors {
  return {
    light: {
      '--primary': `oklch(0.25 0.04 ${hue})`,
      '--primary-foreground': `oklch(0.985 0.004 ${hue})`,
      '--ring': `oklch(0.55 0.06 ${hue})`,
    },
    dark: {
      '--primary': `oklch(0.68 0.12 ${hue})`,
      '--primary-foreground': `oklch(0.985 0.004 ${hue})`,
      '--ring': `oklch(0.55 0.09 ${hue})`,
    },
  }
}

export function applyThemeColors(colors: ThemeColors, mode: 'light' | 'dark'): void {
  const vars = colors[mode]
  const el = document.documentElement.style
  for (const key of THEME_VARIABLES) {
    if (vars[key] !== undefined) {
      el.setProperty(key, vars[key])
    }
  }
}

export function removeThemeColors(): void {
  const el = document.documentElement.style
  for (const key of THEME_VARIABLES) {
    el.removeProperty(key)
  }
}
