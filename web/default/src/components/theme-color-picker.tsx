import { useTranslation } from 'react-i18next'
import { RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useThemeColor } from '@/context/theme-color-provider'
import { PRESET_HUES, DEFAULT_HUE, hueToHex, hexToHue } from '@/lib/theme-color'
import { Button } from '@/components/ui/button'

function SectionTitle({
  title,
  showReset = false,
  onReset,
  className,
}: {
  title: string
  showReset?: boolean
  onReset?: () => void
  className?: string
}) {
  const { t } = useTranslation()
  return (
    <div
      className={cn(
        'text-muted-foreground mb-2 flex items-center gap-2 text-sm font-semibold',
        className
      )}
    >
      {title}
      {showReset && onReset && (
        <Button
          size='icon'
          variant='secondary'
          className='size-4 rounded-full'
          onClick={onReset}
          aria-label={t('Reset to default color')}
        >
          <RotateCcw className='size-3' aria-hidden='true' />
        </Button>
      )}
    </div>
  )
}

export function ThemeColorConfig() {
  const { t } = useTranslation()
  const { hue, setHue, resetHue } = useThemeColor()

  const activeHue = hue ?? DEFAULT_HUE

  return (
    <div>
      <SectionTitle
        title={t('Theme Color')}
        showReset={hue !== null}
        onReset={resetHue}
      />
      <div
        role='radiogroup'
        aria-label={t('Choose a primary color for the interface')}
        className='grid grid-cols-8 gap-2'
      >
        {PRESET_HUES.map((preset) => (
          <button
            key={preset.hue}
            type='button'
            role='radio'
            aria-checked={activeHue === preset.hue}
            aria-label={preset.name}
            onClick={() => setHue(preset.hue)}
            className={cn(
              'rounded-full size-7 border-0 p-0 transition-shadow',
              activeHue === preset.hue &&
                'ring-2 ring-primary ring-offset-2 ring-offset-background'
            )}
            style={{ backgroundColor: hueToHex(preset.hue) }}
          />
        ))}
      </div>
      <div className='mt-3 flex items-center gap-2'>
        <span className='text-muted-foreground text-sm'>
          {t('Custom color')}
        </span>
        <input
          type='color'
          value={hueToHex(activeHue)}
          onChange={(e) => {
            const newHue = hexToHue(e.target.value)
            setHue(newHue)
          }}
          className='size-7 cursor-pointer rounded-md border border-border'
        />
      </div>
    </div>
  )
}
