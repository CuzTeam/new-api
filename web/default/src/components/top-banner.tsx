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

export function TopBanner() {
  const { data: bannerResponse } = useQuery({
    queryKey: ['banner'],
    queryFn: getBanner,
    staleTime: 1000 * 60 * 5,
  })

  const { dismissBanner, isBannerDismissed } = useBannerStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const [shouldScroll, setShouldScroll] = useState(false)

  const content = bannerResponse?.success
    ? (bannerResponse.data?.content || '').trim()
    : ''
  const backgroundColor = bannerResponse?.success
    ? (bannerResponse.data?.background_color || '').trim()
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
    const containerWidth = containerRef.current.offsetWidth
    const textWidth = textRef.current.scrollWidth
    setShouldScroll(textWidth > containerWidth)
  }, [content])

  if (!content) return null

  if (isBannerDismissed(contentHash)) return null

  const bgStyle: React.CSSProperties = (() => {
    if (!backgroundColor) {
      return { backgroundColor: 'hsl(var(--primary))' }
    }
    if (
      backgroundColor.startsWith('linear-gradient') ||
      backgroundColor.startsWith('radial-gradient') ||
      backgroundColor.startsWith('conic-gradient')
    ) {
      return { background: backgroundColor }
    }
    return { backgroundColor }
  })()

  const fontColorStyle: React.CSSProperties = fontColor
    ? { color: fontColor }
    : { color: 'hsl(var(--primary-foreground))' }

  return (
    <div
      className='relative flex items-center px-4 py-1.5 text-sm'
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
          <div className='text-center'>
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
