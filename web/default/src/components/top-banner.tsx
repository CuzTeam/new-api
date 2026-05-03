import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  AlertTriangle,
  CheckCircle2,
  Megaphone,
  ShieldAlert,
  Siren,
  Wrench,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getBanner } from '@/lib/api'
import { useBannerStore } from '@/stores/banner-store'

type BannerMeta = {
  labelKey: string
  icon: LucideIcon
  className: string
}

const bannerTypes: Record<string, BannerMeta> = {
  notice: {
    labelKey: 'Notice',
    icon: Megaphone,
    className: 'top-banner-notice',
  },
  maintenance: {
    labelKey: 'Maintenance',
    icon: Wrench,
    className: 'top-banner-maintenance',
  },
  important: {
    labelKey: 'Important Notice',
    icon: ShieldAlert,
    className: 'top-banner-important',
  },
  warning: {
    labelKey: 'Warning',
    icon: AlertTriangle,
    className: 'top-banner-warning',
  },
  outage: {
    labelKey: 'Incident',
    icon: Siren,
    className: 'top-banner-outage',
  },
  success: {
    labelKey: 'Success',
    icon: CheckCircle2,
    className: 'top-banner-success',
  },
}

type BannerType = 'notice' | 'maintenance' | 'important' | 'warning' | 'outage' | 'success'
type BannerSpeed = 'slow' | 'medium' | 'fast'

const allowedBannerPresets = new Set([
  'notice-glass',
  'maintenance-stripe',
  'important-alert',
  'warning-soft',
  'incident-critical',
  'success-soft',
  'flow',
  'pulse',
  'shimmer',
  'rainbow',
  'aurora',
  'spotlight',
  'scanline',
  'solid',
  'gradient',
])

const fixedBannerPresetTypes: Record<string, BannerType> = {
  'notice-glass': 'notice',
  'maintenance-stripe': 'maintenance',
  'important-alert': 'important',
  'warning-soft': 'warning',
  'incident-critical': 'outage',
  'success-soft': 'success',
}

const colorEditableBannerPresets = new Set([
  'flow',
  'pulse',
  'shimmer',
  'rainbow',
  'aurora',
  'spotlight',
  'scanline',
  'solid',
  'gradient',
])

function normalizeBannerSpeed(value: string): BannerSpeed {
  return value === 'slow' || value === 'fast' ? value : 'medium'
}

function getPresetClassName(preset: string, speed: string): string {
  if (!allowedBannerPresets.has(preset)) return ''
  return `banner-preset-${preset} banner-speed-${normalizeBannerSpeed(speed)}`
}

function normalizeBannerType(value: string): BannerType {
  return value in bannerTypes ? (value as BannerType) : 'notice'
}

function normalizeBoolean(value: string | undefined, fallback = true): boolean {
  if (value === 'true') return true
  if (value === 'false') return false
  return fallback
}

function hashString(input: string): string {
  let hash = 0
  if (!input) return '0'
  for (let i = 0; i < input.length; i += 1) {
    const chr = input.charCodeAt(i)
    hash = (hash << 5) - hash + chr
    hash |= 0
  }
  return hash.toString(36)
}

function sanitizeCSS(css: string): string {
  return css
    .replace(/javascript\s*:/gi, '')
    .replace(/expression\s*\(/gi, '')
    .replace(/-moz-binding\s*:/gi, '')
    .replace(/@import\s+/gi, '')
}

function buildPresetStyle(preset: string, colors: string): React.CSSProperties {
  const colorList = colors.split(',').map((c) => c.trim()).filter(Boolean)
  if (colorList.length === 0) return {}

  return colorList.slice(0, 4).reduce<React.CSSProperties>(
    (style, color, index) => ({
      ...style,
      [`--banner-color-${index + 1}`]: color,
    }),
    preset === 'solid'
      ? { '--banner-color-2': colorList[0] } as React.CSSProperties
      : {}
  )
}

function buildVisualCSS(config: string): string {
  if (!config) return ''
  try {
    const c = JSON.parse(config)
    const parts: string[] = []

    if (c.background) {
      const bg = c.background
      if (bg.type === 'solid' && bg.stops?.[0]?.color) {
        parts.push(`background-color: ${bg.stops[0].color};`)
      } else if (bg.type === 'gradient' && bg.stops?.length) {
        const dir = bg.direction || 'to right'
        const stops = bg.stops.map((s: { color: string; position: number }) => `${s.color} ${s.position}%`).join(', ')
        parts.push(`background: linear-gradient(${dir}, ${stops});`)
      }
    }

    if (c.animation && c.animation.type !== 'none') {
      const size = c.animation.size || 400
      parts.push(`background-size: ${size}% ${size}%;`)
      const duration = c.animation.duration || 8
      const direction = c.animation.direction || 'normal'
      if (c.animation.type === 'flow') {
        parts.push(`animation: banner-flow ${duration}s ease infinite ${direction};`)
      } else if (c.animation.type === 'pulse') {
        parts.push(`animation: banner-pulse ${duration}s ease-in-out infinite ${direction};`)
      } else if (c.animation.type === 'blink') {
        parts.push(`animation: banner-pulse ${duration}s step-end infinite ${direction};`)
      }
    }

    return parts.join('\n')
  } catch {
    return ''
  }
}

function scopeCustomSelector(selector: string, scope: string): string {
  const trimmed = selector.trim()
  if (!trimmed) return ''
  if (trimmed.includes('&')) return trimmed.replace(/&/g, scope)
  if (trimmed.startsWith('.top-banner')) return trimmed.replace(/^\.top-banner/, scope)
  if (trimmed.startsWith(':')) return `${scope}${trimmed}`
  return `${scope} ${trimmed}`
}

function buildScopedCustomCSS(css: string): string {
  const sanitized = sanitizeCSS(css).trim()
  const scope = '.top-banner[data-banner-mode="code"]'
  if (!sanitized) return ''
  if (!sanitized.includes('{')) {
    return `${scope} { ${sanitized} }`
  }

  let source = sanitized
  const output: string[] = []
  const firstBrace = source.indexOf('{')
  const firstHeader = source.slice(0, firstBrace)
  const selectorStart = firstHeader.lastIndexOf('\n') + 1
  const leadingDeclarations = firstHeader.slice(0, selectorStart).trim()

  if (leadingDeclarations.includes(':')) {
    output.push(`${scope} { ${leadingDeclarations} }`)
    source = source.slice(selectorStart)
  }

  source = source.replace(/@keyframes\s+[^{]+\{[\s\S]*?\n\}/g, (match) => {
    output.push(match)
    return ''
  })

  source.replace(/([^{}]+)\{([^{}]*)\}/g, (_match, selectorText: string, body: string) => {
    const scopedSelector = selectorText
      .split(',')
      .map((selector) => scopeCustomSelector(selector, scope))
      .filter(Boolean)
      .join(', ')

    if (scopedSelector && body.trim()) {
      output.push(`${scopedSelector} { ${body.trim()} }`)
    }
    return ''
  })

  return output.join('\n')
}

export function TopBanner() {
  const { t } = useTranslation()
  const { data: bannerResponse } = useQuery({
    queryKey: ['banner'],
    queryFn: getBanner,
    staleTime: 1000 * 60 * 5,
  })

  const { dismissBanner, isBannerDismissed } = useBannerStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLSpanElement>(null)
  const styleRef = useRef<HTMLStyleElement | null>(null)
  const [shouldScroll, setShouldScroll] = useState(false)

  const content = bannerResponse?.success
    ? (bannerResponse.data?.content || '').trim()
    : ''
  const type = bannerResponse?.success
    ? normalizeBannerType((bannerResponse.data?.type || 'notice').trim())
    : 'notice'
  const dismissible = bannerResponse?.success
    ? normalizeBoolean((bannerResponse.data?.dismissible || 'true').trim(), true)
    : true
  const mode = bannerResponse?.success
    ? (bannerResponse.data?.mode || '').trim()
    : ''
  const preset = bannerResponse?.success
    ? (bannerResponse.data?.preset || '').trim()
    : ''
  const colors = bannerResponse?.success
    ? (bannerResponse.data?.colors || '').trim()
    : ''
  const speed = bannerResponse?.success
    ? (bannerResponse.data?.speed || 'medium').trim()
    : 'medium'
  const visualConfig = bannerResponse?.success
    ? (bannerResponse.data?.visual_config || '').trim()
    : ''
  const customCSS = bannerResponse?.success
    ? (bannerResponse.data?.custom_css || '').trim()
    : ''
  const fontColor = bannerResponse?.success
    ? (bannerResponse.data?.font_color || '').trim()
    : ''

  const contentHash = hashString(content)

  useLayoutEffect(() => {
    if (!content || !containerRef.current || !measureRef.current) {
      setShouldScroll(false)
      return
    }

    const container = containerRef.current
    const measureNode = measureRef.current
    let frame = 0
    let disposed = false

    const measureOverflow = () => {
      if (disposed) return
      const containerWidth = container.clientWidth
      const textWidth = measureNode.scrollWidth
      setShouldScroll(textWidth > containerWidth)
    }

    const scheduleMeasure = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measureOverflow)
    }

    measureOverflow()

    const resizeObserver = new ResizeObserver(scheduleMeasure)
    resizeObserver.observe(container)
    resizeObserver.observe(measureNode)

    document.fonts?.ready.then(scheduleMeasure).catch(() => {})

    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
    }
  }, [content, type, t])

  useEffect(() => {
    if (!content) return

    let css = ''
    if (mode === 'visual' && visualConfig) {
      css = `.top-banner { ${sanitizeCSS(buildVisualCSS(visualConfig))} }`
    } else if (mode === 'code' && customCSS) {
      css = buildScopedCustomCSS(customCSS)
    }

    if (styleRef.current) {
      styleRef.current.remove()
      styleRef.current = null
    }

    if (css) {
      const styleEl = document.createElement('style')
      styleEl.textContent = css
      document.head.appendChild(styleEl)
      styleRef.current = styleEl
    }

    return () => {
      if (styleRef.current) {
        styleRef.current.remove()
        styleRef.current = null
      }
    }
  }, [content, mode, visualConfig, customCSS])

  if (!content) return null

  if (dismissible && isBannerDismissed(contentHash)) return null

  const fontColorStyle: React.CSSProperties = fontColor
    ? { color: fontColor }
    : {}

  const presetClass = mode === 'preset' && preset
    ? getPresetClassName(preset, speed)
    : ''

  const resolvedType = mode === 'preset' && fixedBannerPresetTypes[preset]
    ? fixedBannerPresetTypes[preset]
    : type
  const bannerMeta = bannerTypes[resolvedType]
  const BannerIcon = bannerMeta.icon
  const bannerLabel = t(bannerMeta.labelKey)

  const bgStyle: React.CSSProperties = (() => {
    if (mode === 'preset' && colorEditableBannerPresets.has(preset) && colors.trim()) {
      return buildPresetStyle(preset, colors)
    }
    return {}
  })()

  return (
    <div
      className={`top-banner ${bannerMeta.className} relative flex items-center text-sm ${presetClass}`}
      data-banner-mode={mode === 'code' ? 'code' : mode === 'preset' ? 'preset' : 'default'}
      style={{ ...bgStyle, ...fontColorStyle }}
    >
      <span className='top-banner-icon'>
        <BannerIcon className='h-3.5 w-3.5' />
      </span>
      <div
        ref={containerRef}
        className='top-banner-copy flex-1 overflow-hidden'
      >
        <span ref={measureRef} className='top-banner-measure' aria-hidden='true'>
          <strong>{bannerLabel}</strong>
          <span className='top-banner-separator'>/</span>
          {content}
        </span>
        {shouldScroll ? (
          <div className='inline-flex animate-marquee whitespace-nowrap'>
            <span className='top-banner-message top-banner-message-scroll'>
              <strong>{bannerLabel}</strong>
              <span className='top-banner-separator'>/</span>
              {content}
            </span>
            <span className='top-banner-message top-banner-message-scroll' aria-hidden='true'>
              <strong>{bannerLabel}</strong>
              <span className='top-banner-separator'>/</span>
              {content}
            </span>
          </div>
        ) : (
          <div className='whitespace-nowrap text-center'>
            <span className='top-banner-message'>
              <strong>{bannerLabel}</strong>
              <span className='top-banner-separator'>/</span>
              {content}
            </span>
          </div>
        )}
      </div>
      {dismissible && (
        <button
          type='button'
          onClick={() => dismissBanner(contentHash)}
          className='ml-2 shrink-0 rounded-sm opacity-70 hover:opacity-100'
        >
          <X className='h-4 w-4' />
        </button>
      )}
    </div>
  )
}
