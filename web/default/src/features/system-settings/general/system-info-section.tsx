import * as z from 'zod'
import { useEffect } from 'react'
import type { Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { FormDirtyIndicator } from '../components/form-dirty-indicator'
import { FormNavigationGuard } from '../components/form-navigation-guard'
import { SettingsSection } from '../components/settings-section'
import { useSettingsForm } from '../hooks/use-settings-form'
import { useUpdateOption } from '../hooks/use-update-option'

const flowTemplate = `background: linear-gradient(270deg, #ff0000, #0000ff);
background-size: 400% 400%;
animation: banner-flow 8s ease infinite;`

const pulseTemplate = `animation: banner-pulse 2s ease-in-out infinite;`

const shimmerTemplate = `position: relative;
overflow: hidden;
&::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
  animation: banner-shimmer 3s infinite;
}`

const rainbowTemplate = `animation: banner-rainbow 8s linear infinite;`

const bannerPaletteGroups = [
  {
    nameKey: 'Professional',
    colors: ['#0f172a', '#1d4ed8', '#2563eb', '#0891b2', '#0f766e', '#047857'],
  },
  {
    nameKey: 'Warm',
    colors: ['#f59e0b', '#ea580c', '#dc2626', '#be123c', '#9333ea', '#7c3aed'],
  },
  {
    nameKey: 'Soft',
    colors: ['#eff6ff', '#ecfeff', '#ecfdf5', '#fff7ed', '#fff1f2', '#f8fafc'],
  },
  {
    nameKey: 'Dark',
    colors: ['#020617', '#111827', '#1f2937', '#312e81', '#450a0a', '#064e3b'],
  },
]

const fixedBannerPresets = new Set([
  'notice-glass',
  'maintenance-stripe',
  'important-alert',
  'warning-soft',
  'incident-critical',
  'success-soft',
])

const bannerTextColorPalette = [
  '#ffffff',
  '#f8fafc',
  '#e5e7eb',
  '#111827',
  '#020617',
  '#2563eb',
  '#047857',
  '#b45309',
  '#dc2626',
  '#7c3aed',
]

function parseBannerColors(value: string): string[] {
  return value.split(',').map((color) => color.trim()).filter(Boolean)
}

function stringifyBannerColors(colors: string[]): string {
  return colors.filter(Boolean).join(',')
}

function normalizeHexColor(value: string, fallback = '#2563eb'): string {
  return /^#[0-9a-f]{6}$/i.test(value) ? value : fallback
}

const _systemInfoSchema = z.object({
  theme: z.object({
    frontend: z.enum(['default', 'classic']),
  }),
  Notice: z.string().optional(),
  BannerContent: z.string().optional(),
  BannerType: z.string().optional(),
  BannerDismissible: z.string().optional(),
  BannerMode: z.string().optional(),
  BannerPreset: z.string().optional(),
  BannerColors: z.string().optional(),
  BannerSpeed: z.string().optional(),
  BannerVisualConfig: z.string().optional(),
  BannerCustomCSS: z.string().optional(),
  BannerFontColor: z.string().optional(),
  SystemName: z.string().min(1),
  ServerAddress: z.string().optional(),
  Logo: z.string().url().optional().or(z.literal('')),
  Footer: z.string().optional(),
  About: z.string().optional(),
  HomePageContent: z.string().optional(),
  legal: z.object({
    user_agreement: z.string().optional(),
    privacy_policy: z.string().optional(),
  }),
})

type SystemInfoFormValues = z.infer<typeof _systemInfoSchema>

type SystemInfoSectionProps = {
  defaultValues: SystemInfoFormValues
}

function normalizeValue(value: unknown): string {
  if (value === undefined || value === null) return ''
  return typeof value === 'string' ? value : String(value)
}

export function SystemInfoSection({ defaultValues }: SystemInfoSectionProps) {
  const { t } = useTranslation()
  const updateOption = useUpdateOption()

  const normalizedDefaults: SystemInfoFormValues = {
    theme: {
      frontend:
        defaultValues.theme?.frontend === 'classic' ? 'classic' : 'default',
    },
    Notice: normalizeValue(defaultValues.Notice),
    BannerContent: normalizeValue(defaultValues.BannerContent),
    BannerType: normalizeValue(defaultValues.BannerType) || 'notice',
    BannerDismissible: normalizeValue(defaultValues.BannerDismissible) || 'true',
    BannerMode: normalizeValue(defaultValues.BannerMode),
    BannerPreset: normalizeValue(defaultValues.BannerPreset),
    BannerColors: normalizeValue(defaultValues.BannerColors),
    BannerSpeed: normalizeValue(defaultValues.BannerSpeed) || 'medium',
    BannerVisualConfig: normalizeValue(defaultValues.BannerVisualConfig),
    BannerCustomCSS: normalizeValue(defaultValues.BannerCustomCSS),
    BannerFontColor: normalizeValue(defaultValues.BannerFontColor),
    SystemName: normalizeValue(defaultValues.SystemName),
    ServerAddress: normalizeValue(defaultValues.ServerAddress),
    Logo: normalizeValue(defaultValues.Logo),
    Footer: normalizeValue(defaultValues.Footer),
    About: normalizeValue(defaultValues.About),
    HomePageContent: normalizeValue(defaultValues.HomePageContent),
    legal: {
      user_agreement: normalizeValue(defaultValues.legal?.user_agreement),
      privacy_policy: normalizeValue(defaultValues.legal?.privacy_policy),
    },
  }

  const systemInfoSchemaWithI18n = z.object({
    theme: z.object({
      frontend: z.enum(['default', 'classic']),
    }),
    Notice: z.string().optional(),
    BannerContent: z.string().optional(),
    BannerType: z.string().optional(),
    BannerDismissible: z.string().optional(),
    BannerMode: z.string().optional(),
    BannerPreset: z.string().optional(),
    BannerColors: z.string().optional(),
    BannerSpeed: z.string().optional(),
    BannerVisualConfig: z.string().optional(),
    BannerCustomCSS: z.string().optional(),
    BannerFontColor: z.string().optional(),
    SystemName: z.string().min(1, {
      error: () => t('System name is required'),
    }),
    ServerAddress: z.string().optional(),
    Logo: z.string().url().optional().or(z.literal('')),
    Footer: z.string().optional(),
    About: z.string().optional(),
    HomePageContent: z.string().optional(),
    legal: z.object({
      user_agreement: z.string().optional(),
      privacy_policy: z.string().optional(),
    }),
  })

  const { form, handleSubmit, handleReset, isDirty, isSubmitting } =
    useSettingsForm<SystemInfoFormValues>({
      resolver: zodResolver(systemInfoSchemaWithI18n) as Resolver<
        SystemInfoFormValues,
        unknown,
        SystemInfoFormValues
      >,
      defaultValues: normalizedDefaults,
      onSubmit: async (_data, changedFields) => {
        for (const [key, value] of Object.entries(changedFields)) {
          let v = normalizeValue(value)
          if (key === 'ServerAddress') {
            v = v.replace(/\/+$/, '')
          }
          await updateOption.mutateAsync({
            key,
            value: v,
          })
        }
      },
  })

  const rawBannerMode = form.watch('BannerMode') || 'preset'
  const bannerMode = rawBannerMode === 'code' ? 'code' : 'preset'
  const bannerPreset = form.watch('BannerPreset') || 'flow'
  const showBannerPalette = bannerMode === 'preset' && !fixedBannerPresets.has(bannerPreset)

  useEffect(() => {
    if (rawBannerMode !== bannerMode) {
      form.setValue('BannerMode', bannerMode, { shouldDirty: true })
    }
  }, [bannerMode, form, rawBannerMode])

  return (
    <>
      <FormNavigationGuard when={isDirty} />

      <SettingsSection
        title={t('System Information')}
        description={t('Configure basic system information and branding')}
      >
        <Form {...form}>
          <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
            <FormDirtyIndicator isDirty={isDirty} />
            <FormField
              control={form.control}
              name='theme.frontend'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Frontend Theme')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='default'>
                        {t('Default (New Frontend)')}
                      </SelectItem>
                      <SelectItem value='classic'>
                        {t('Classic (Legacy Frontend)')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {t(
                      'Switch between the new frontend and the classic frontend. Changes take effect after page reload.'
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='Notice'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Notice')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t(
                        'Enter announcement content (supports Markdown & HTML)'
                      )}
                      rows={6}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t(
                      'Announcement displayed to users (supports Markdown & HTML)'
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='BannerContent'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Banner Content')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t(
                        'Enter banner content to display at the top of the page'
                      )}
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t(
                      'A text banner displayed at the top of all pages. Leave empty to disable.'
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='BannerType'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Banner Type')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || 'notice'}>
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='notice'>{t('Notice')}</SelectItem>
                      <SelectItem value='maintenance'>{t('Maintenance')}</SelectItem>
                      <SelectItem value='important'>{t('Important Notice')}</SelectItem>
                      <SelectItem value='warning'>{t('Warning')}</SelectItem>
                      <SelectItem value='outage'>{t('Incident')}</SelectItem>
                      <SelectItem value='success'>{t('Success')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {t('Choose the banner category. Each category uses a matching visual style.')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='BannerDismissible'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-base'>
                      {t('Banner Dismissible')}
                    </FormLabel>
                    <FormDescription>
                      {t('Allow users to close this banner. If disabled, the close button is hidden.')}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={(field.value || 'true') === 'true'}
                      onCheckedChange={(checked) => field.onChange(String(checked))}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='BannerMode'
              render={({ field }) => (
                <input type='hidden' {...field} />
              )}
            />

            <Tabs
              value={bannerMode}
              onValueChange={(v) => form.setValue('BannerMode', v, { shouldDirty: true })}
            >
              <TabsList className='w-full'>
                <TabsTrigger value='preset' className='flex-1'>
                  {t('Preset')}
                </TabsTrigger>
                <TabsTrigger value='code' className='flex-1'>
                  {t('Code')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value='preset' className='mt-4'>
                <Card>
                  <CardHeader>
                    <CardTitle>{t('Preset Background')}</CardTitle>
                    <CardDescription>
                      {t('Choose a preset effect and customize colors and speed.')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='flex flex-col gap-4'>
                    <FormField
                      control={form.control}
                      name='BannerPreset'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('Effect')}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || 'flow'}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>{t('Notification Presets')}</SelectLabel>
                                <SelectItem value='notice-glass'>{t('Notice Glass')}</SelectItem>
                                <SelectItem value='maintenance-stripe'>{t('Maintenance Stripe')}</SelectItem>
                                <SelectItem value='important-alert'>{t('Important Alert')}</SelectItem>
                                <SelectItem value='warning-soft'>{t('Warning Soft')}</SelectItem>
                                <SelectItem value='incident-critical'>{t('Incident Critical')}</SelectItem>
                                <SelectItem value='success-soft'>{t('Success Soft')}</SelectItem>
                              </SelectGroup>
                              <SelectSeparator />
                              <SelectGroup>
                                <SelectLabel>{t('Animation Presets')}</SelectLabel>
                                <SelectItem value='flow'>{t('Flowing Gradient')}</SelectItem>
                                <SelectItem value='pulse'>{t('Pulse')}</SelectItem>
                                <SelectItem value='shimmer'>{t('Shimmer')}</SelectItem>
                                <SelectItem value='rainbow'>{t('Rainbow')}</SelectItem>
                                <SelectItem value='aurora'>{t('Aurora')}</SelectItem>
                                <SelectItem value='spotlight'>{t('Spotlight')}</SelectItem>
                                <SelectItem value='scanline'>{t('Scanline')}</SelectItem>
                                <SelectItem value='solid'>{t('Solid Color')}</SelectItem>
                                <SelectItem value='gradient'>{t('Static Gradient')}</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            {fixedBannerPresets.has(field.value || '')
                              ? t('Notification presets use fixed category colors and ignore the color palette.')
                              : t('Animation presets can use custom colors and speed.')}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='BannerColors'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('Colors')}</FormLabel>
                          {showBannerPalette ? (
                            <FormControl>
                              <div className='space-y-4'>
                                <div className='grid gap-3 sm:grid-cols-2'>
                                  {(bannerPreset === 'solid'
                                    ? [parseBannerColors(field.value || '')[0] || '#2563eb']
                                    : [
                                        parseBannerColors(field.value || '')[0] || '#0f172a',
                                        parseBannerColors(field.value || '')[1] || '#2563eb',
                                      ]
                                  ).map((color, index) => {
                                    const colors = parseBannerColors(field.value || '')
                                    const normalizedColor = normalizeHexColor(color)
                                    return (
                                      <div key={index} className='space-y-2'>
                                        <div className='text-muted-foreground text-xs font-medium'>
                                          {bannerPreset === 'solid'
                                            ? t('Background color')
                                            : t(index === 0 ? 'Start color' : 'End color')}
                                        </div>
                                        <div className='flex items-center gap-2'>
                                          <input
                                            type='color'
                                            value={normalizedColor}
                                            onChange={(event) => {
                                              const nextColors = [...colors]
                                              nextColors[index] = event.target.value
                                              field.onChange(stringifyBannerColors(nextColors))
                                            }}
                                            className='size-9 shrink-0 cursor-pointer rounded-md border border-border bg-transparent p-1'
                                            aria-label={bannerPreset === 'solid'
                                              ? t('Background color')
                                              : t(index === 0 ? 'Start color' : 'End color')}
                                          />
                                          <Input
                                            value={color}
                                            onChange={(event) => {
                                              const nextColors = [...colors]
                                              nextColors[index] = event.target.value.trim()
                                              field.onChange(stringifyBannerColors(nextColors))
                                            }}
                                            placeholder='#2563eb'
                                            className='font-mono'
                                          />
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>

                                <div className='space-y-3'>
                                  {bannerPaletteGroups.map((group) => (
                                    <div key={group.nameKey} className='space-y-2'>
                                      <div className='text-muted-foreground text-xs font-medium'>
                                        {t(group.nameKey)}
                                      </div>
                                      <div className='flex flex-wrap gap-2'>
                                        {group.colors.map((color) => {
                                          const activeColors = parseBannerColors(field.value || '')
                                          const isActive = activeColors.includes(color)
                                          return (
                                            <button
                                              key={color}
                                              type='button'
                                              onClick={() => {
                                                const activeColors = parseBannerColors(field.value || '')
                                                if (bannerPreset === 'solid') {
                                                  field.onChange(color)
                                                  return
                                                }
                                                const nextColors = activeColors.length >= 2
                                                  ? [activeColors[1], color]
                                                  : [...activeColors, color]
                                                field.onChange(stringifyBannerColors(nextColors))
                                              }}
                                              className={cn(
                                                'size-7 rounded-md border border-border transition-shadow',
                                                isActive && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                                              )}
                                              style={{ backgroundColor: color }}
                                              aria-label={color}
                                              title={color}
                                            />
                                          )
                                        })}
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                <Input
                                  value={field.value || ''}
                                  onChange={field.onChange}
                                  placeholder={t('e.g., #ff0000,#0000ff')}
                                  className='font-mono'
                                />
                              </div>
                            </FormControl>
                          ) : (
                            <FormControl>
                              <Input
                                placeholder={t('e.g., #ff0000,#0000ff')}
                                {...field}
                                disabled
                              />
                            </FormControl>
                          )}
                          <FormDescription>
                            {showBannerPalette
                              ? t('Pick colors from the palette or enter CSS color values manually.')
                              : t('This notification preset uses fixed colors. Switch to an animation preset to customize colors.')}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='BannerSpeed'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('Speed')}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || 'medium'}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value='slow'>{t('Slow')}</SelectItem>
                              <SelectItem value='medium'>{t('Medium')}</SelectItem>
                              <SelectItem value='fast'>{t('Fast')}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value='code' className='mt-4'>
                <Card>
                  <CardHeader>
                    <CardTitle>{t('Custom CSS')}</CardTitle>
                    <CardDescription>
                      {t('Write custom CSS for the banner. Use declarations directly, or use & for scoped selectors such as &::before and & .top-banner-icon.')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='flex flex-col gap-4'>
                    <div className='flex flex-wrap gap-2'>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => form.setValue('BannerCustomCSS', flowTemplate, { shouldDirty: true })}
                      >
                        {t('Flowing Gradient')}
                      </Button>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => form.setValue('BannerCustomCSS', pulseTemplate, { shouldDirty: true })}
                      >
                        {t('Pulse')}
                      </Button>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => form.setValue('BannerCustomCSS', shimmerTemplate, { shouldDirty: true })}
                      >
                        {t('Shimmer')}
                      </Button>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => form.setValue('BannerCustomCSS', rainbowTemplate, { shouldDirty: true })}
                      >
                        {t('Rainbow')}
                      </Button>
                    </div>
                    <FormField
                      control={form.control}
                      name='BannerCustomCSS'
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              className='font-mono text-sm'
                              rows={10}
                              placeholder={t('Enter custom CSS...')}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <FormField
              control={form.control}
              name='BannerFontColor'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Banner Font Color')}</FormLabel>
                  <FormControl>
                    <div className='space-y-3'>
                      <div className='flex items-center gap-2'>
                        <input
                          type='color'
                          value={normalizeHexColor(field.value || '#ffffff', '#ffffff')}
                          onChange={(event) => field.onChange(event.target.value)}
                          className='size-9 shrink-0 cursor-pointer rounded-md border border-border bg-transparent p-1'
                          aria-label={t('Banner Font Color')}
                        />
                        <Input
                          placeholder={t('e.g., #ffffff or white')}
                          value={field.value || ''}
                          onChange={field.onChange}
                          className='font-mono'
                        />
                        <Button
                          type='button'
                          variant='secondary'
                          onClick={() => field.onChange('')}
                          className='shrink-0'
                        >
                          {t('Default')}
                        </Button>
                      </div>

                      <div className='flex flex-wrap gap-2'>
                        {bannerTextColorPalette.map((color) => {
                          const isActive = field.value === color
                          return (
                            <button
                              key={color}
                              type='button'
                              onClick={() => field.onChange(color)}
                              className={cn(
                                'size-7 rounded-md border border-border transition-shadow',
                                isActive && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                              )}
                              style={{ backgroundColor: color }}
                              aria-label={color}
                              title={color}
                            />
                          )
                        })}
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    {t(
                      'Font color for the banner text. Supports any CSS color value. Leave empty for default.'
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='SystemName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('System Name')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('New API')} {...field} />
                  </FormControl>
                  <FormDescription>
                    {t('The name displayed across the application')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='ServerAddress'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Server Address')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('https://yourdomain.com')} {...field} />
                  </FormControl>
                  <FormDescription>
                    {t(
                      'The public URL of your server, used for OAuth callbacks, webhooks, and other external integrations'
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='Logo'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Logo URL')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('https://example.com/logo.png')}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t('URL to your logo image (optional)')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='Footer'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Footer')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t(
                        '© 2025 Your Company. All rights reserved.'
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t('Footer text displayed at the bottom of pages')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='About'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('About')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t(
                        'Enter HTML code (e.g., <p>About us...</p>) or a URL (e.g., https://example.com) to embed as iframe'
                      )}
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t(
                      'Supports HTML markup or iframe embedding. Enter HTML code directly, or provide a complete URL to automatically embed it as an iframe.'
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='HomePageContent'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Home Page Content')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('Welcome to our New API...')}
                      rows={6}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t(
                      'Content displayed on the home page (supports Markdown)'
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='legal.user_agreement'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('User Agreement')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t(
                        'Provide Markdown, HTML, or an external URL for the user agreement'
                      )}
                      rows={6}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t(
                      'Leave empty to disable the agreement requirement. Supports Markdown, HTML, or a full URL to redirect users.'
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='legal.privacy_policy'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Privacy Policy')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t(
                        'Provide Markdown, HTML, or an external URL for the privacy policy'
                      )}
                      rows={6}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t(
                      'Leave empty to disable the privacy policy requirement. Supports Markdown, HTML, or a full URL to redirect users.'
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex gap-2'>
              <Button
                type='submit'
                disabled={isSubmitting || updateOption.isPending}
              >
                {updateOption.isPending ? t('Saving...') : t('Save Changes')}
              </Button>
              <Button
                type='button'
                variant='outline'
                onClick={handleReset}
                disabled={!isDirty || updateOption.isPending || isSubmitting}
              >
                <RotateCcw className='mr-2 h-4 w-4' />
                {t('Reset')}
              </Button>
            </div>
          </form>
        </Form>
      </SettingsSection>
    </>
  )
}
