import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { getBanner } from '@/lib/api'
import { useBannerStore } from '@/stores/banner-store'

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
  if (colorList.length === 0) return { backgroundColor: 'hsl(var(--primary))' }

  if (preset === 'solid' || colorList.length === 1) {
    return { backgroundColor: colorList[0] }
  }

  const gradient = `linear-gradient(to right, ${colorList.join(', ')})`
  if (preset === 'gradient') {
    return { background: gradient, backgroundSize: '100% 100%' }
  }

  return { background: gradient, backgroundSize: '400% 400%' }
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

export function TopBanner() {
  const { data: bannerResponse } = useQuery({
    queryKey: ['banner'],
    queryFn: getBanner,
    staleTime: 1000 * 60 * 5,
  })

  const { dismissBanner, isBannerDismissed } = useBannerStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const styleRef = useRef<HTMLStyleElement | null>(null)
  const [shouldScroll, setShouldScroll] = useState(false)

  const content = bannerResponse?.success
    ? (bannerResponse.data?.content || '').trim()
    : ''
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

  useEffect(() => {
    if (!content || !containerRef.current || !textRef.current) {
      setShouldScroll(false)
      return
    }
    const containerWidth = containerRef.current.clientWidth
    const textWidth = textRef.current.offsetWidth
    setShouldScroll(textWidth > containerWidth)
  }, [content])

  useEffect(() => {
    if (!content) return

    let css = ''
    if (mode === 'visual' && visualConfig) {
      css = sanitizeCSS(buildVisualCSS(visualConfig))
    } else if (mode === 'code' && customCSS) {
      css = sanitizeCSS(customCSS)
    }

    if (styleRef.current) {
      styleRef.current.remove()
      styleRef.current = null
    }

    if (css) {
      const styleEl = document.createElement('style')
      styleEl.textContent = `.top-banner { ${css} }`
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

  if (isBannerDismissed(contentHash)) return null

  const fontColorStyle: React.CSSProperties = fontColor
    ? { color: fontColor }
    : { color: 'hsl(var(--primary-foreground))' }

  const presetClass = mode === 'preset' && preset
    ? `banner-preset-${preset} banner-speed-${speed}`
    : ''

  const bgStyle: React.CSSProperties = (() => {
    if (mode === 'preset') {
      return buildPresetStyle(preset, colors)
    }
    if (!mode) {
      return { backgroundColor: 'hsl(var(--primary))' }
    }
    return {}
  })()

  return (
    <div
      className={`top-banner relative flex items-center px-4 py-1.5 text-sm ${presetClass}`}
      style={{ ...bgStyle, ...fontColorStyle }}
    >
      <div
        ref={containerRef}
        className='flex-1 overflow-hidden'
      >
        {shouldScroll ? (
          <div className='inline-flex animate-marquee whitespace-nowrap'>
            <span ref={textRef} className='mr-8'>
              {content}
            </span>
            <span className='mr-8'>{content}</span>
          </div>
        ) : (
          <div className='whitespace-nowrap text-center'>
            <span ref={textRef}>{content}</span>
          </div>
        )}
      </div>
      <button
        type='button'
        onClick={() => dismissBanner(contentHash)}
        className='ml-2 shrink-0 rounded-sm opacity-70 hover:opacity-100'
      >
        <X className='h-4 w-4' />
      </button>
    </div>
  )
}
