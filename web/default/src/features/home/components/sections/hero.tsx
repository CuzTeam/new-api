import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/context/theme-provider'
import { GrainGradient } from '../webgl/grain-gradient'
import { DitherSphere } from '../webgl/dither-sphere'

interface HeroProps {
  className?: string
  isAuthenticated?: boolean
}

export function Hero(props: HeroProps) {
  const { t } = useTranslation()
  const { resolvedTheme } = useTheme()
  const dark = resolvedTheme === 'dark'
  const heroImgSrc = dark
    ? 'https://source.starrysky.ggff.net/ame-assets/ai-bg.png'
    : 'https://source.starrysky.ggff.net/ame-assets/ai-bg-white.png'

  return (
    <section className="hero-replica relative flex h-screen w-full overflow-hidden bg-background">
      <GrainGradient />
      <DitherSphere />

      <div className="relative z-[2] flex h-full w-full flex-col justify-center px-16 py-12 max-md:items-center max-md:px-6 max-md:text-center">
        <p
          className="w-fit rounded-full border border-brand/50 px-3 py-2 text-xs font-medium text-brand"
        >
          {t('the api platform, developers love.')}
        </p>
        <h1
          className="mt-8 text-[clamp(2.25rem,4.5vw,3rem)] font-medium leading-[1.1] tracking-tight xl:text-[3.5rem] xl:mb-12"
        >
          <span className="text-brand">{t('Empowering')}</span>{' '}
          {t('the world with')}{' '}
          <span className="text-brand">{t('free AI')}</span>,<br className="hidden md:block" />
          <br />
          {t('no')} <span className="text-brand">{t('limits')}</span>.
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-4 max-md:justify-center">
          {props.isAuthenticated ? (
            <Link
              to="/dashboard"
              className="btn-hero-primary inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium no-underline tracking-tight transition-opacity hover:opacity-85"
            >
              {t('Getting Started')}
            </Link>
          ) : (
            <>
              <Link
                to="/sign-up"
                className="btn-hero-primary inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium no-underline tracking-tight transition-opacity hover:opacity-85"
              >
                {t('Getting Started')}
              </Link>
              <Link
                to="/playground"
                className="btn-hero-secondary inline-flex items-center justify-center rounded-full border px-5 py-3 text-sm font-medium no-underline tracking-tight transition-opacity hover:opacity-80"
              >
                {t('Playground')}
              </Link>
            </>
          )}
        </div>
      </div>

      <img
        className="hero-image absolute bottom-[-8%] right-[-5%] w-[55%] max-w-[1200px] rounded-xl border-2 border-border aspect-video object-cover opacity-0"
        style={{ animation: 'fadeIn 400ms ease forwards 600ms' }}
        src={heroImgSrc}
        alt="preview"
      />
    </section>
  )
}
