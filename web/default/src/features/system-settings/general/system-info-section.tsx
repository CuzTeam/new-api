import * as z from 'zod'
import type { Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
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
  SelectItem,
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
import { Slider } from '@/components/ui/slider'
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
.banner-preset-shimmer::after {
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

const _systemInfoSchema = z.object({
  theme: z.object({
    frontend: z.enum(['default', 'classic']),
  }),
  Notice: z.string().optional(),
  BannerContent: z.string().optional(),
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

  const bannerMode = form.watch('BannerMode') || 'preset'

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
                <TabsTrigger value='visual' className='flex-1'>
                  {t('Visual')}
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
                              <SelectItem value='flow'>{t('Flowing Gradient')}</SelectItem>
                              <SelectItem value='pulse'>{t('Pulse')}</SelectItem>
                              <SelectItem value='shimmer'>{t('Shimmer')}</SelectItem>
                              <SelectItem value='rainbow'>{t('Rainbow')}</SelectItem>
                              <SelectItem value='solid'>{t('Solid Color')}</SelectItem>
                              <SelectItem value='gradient'>{t('Static Gradient')}</SelectItem>
                            </SelectContent>
                          </Select>
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
                          <FormControl>
                            <Input
                              placeholder={t('e.g., #ff0000,#0000ff')}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            {t('Comma-separated color values. First color is used for solid mode.')}
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

              <TabsContent value='visual' className='mt-4'>
                <div className='flex flex-col gap-4'>
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('Background')}</CardTitle>
                      <CardDescription>
                        {t('Configure the banner background style.')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className='flex flex-col gap-4'>
                      <FormField
                        control={form.control}
                        name='BannerVisualConfig'
                        render={({ field }) => {
                          let config: {
                            background?: { type: string; direction?: string; stops?: Array<{ color: string; position: number }> }
                            animation?: { type: string; duration?: number; direction?: string; size?: number }
                          } = {}
                          try { config = JSON.parse(field.value || '{}') } catch { /* empty */ }

                          const updateConfig = (updates: Record<string, unknown>) => {
                            const newConfig = { ...config, ...updates }
                            field.onChange(JSON.stringify(newConfig))
                          }

                          return (
                            <>
                              <FormItem>
                                <FormLabel>{t('Background Type')}</FormLabel>
                                <Select
                                  value={config.background?.type || 'solid'}
                                  onValueChange={(v) =>
                                    updateConfig({
                                      background: {
                                        ...config.background,
                                        type: v,
                                        stops: config.background?.stops || [{ color: '#3b82f6', position: 0 }, { color: '#8b5cf6', position: 100 }],
                                        direction: config.background?.direction || 'to right',
                                      },
                                    })
                                  }
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value='solid'>{t('Solid')}</SelectItem>
                                    <SelectItem value='gradient'>{t('Gradient')}</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormItem>

                              {config.background?.type === 'gradient' && (
                                <FormItem>
                                  <FormLabel>{t('Direction')}</FormLabel>
                                  <Select
                                    value={config.background?.direction || 'to right'}
                                    onValueChange={(v) =>
                                      updateConfig({
                                        background: { ...config.background, direction: v },
                                      })
                                    }
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value='to right'>{t('→ Right')}</SelectItem>
                                      <SelectItem value='to left'>{t('← Left')}</SelectItem>
                                      <SelectItem value='to bottom'>{t('↓ Down')}</SelectItem>
                                      <SelectItem value='to top'>{t('↑ Up')}</SelectItem>
                                      <SelectItem value='to bottom right'>{t('↘ Diagonal')}</SelectItem>
                                      <SelectItem value='circle'>{t('⊙ Radial')}</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormItem>
                              )}

                              <FormItem>
                                <FormLabel>{t('Color Stops')}</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder={t('e.g., #3b82f6,#8b5cf6')}
                                    value={(config.background?.stops || []).map((s: { color: string }) => s.color).join(',')}
                                    onChange={(e) => {
                                      const colors = e.target.value.split(',').map((c) => c.trim()).filter(Boolean)
                                      const stops = colors.map((color, i) => ({
                                        color,
                                        position: colors.length === 1 ? 0 : Math.round((i / (colors.length - 1)) * 100),
                                      }))
                                      updateConfig({
                                        background: { ...config.background, stops },
                                      })
                                    }}
                                  />
                                </FormControl>
                                <FormDescription>
                                  {t('Comma-separated color values for the gradient.')}
                                </FormDescription>
                              </FormItem>
                            </>
                          )
                        }}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>{t('Animation')}</CardTitle>
                      <CardDescription>
                        {t('Add animation effects to the banner background.')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className='flex flex-col gap-4'>
                      <FormField
                        control={form.control}
                        name='BannerVisualConfig'
                        render={({ field }) => {
                          let config: {
                            background?: { type: string; direction?: string; stops?: Array<{ color: string; position: number }> }
                            animation?: { type: string; duration?: number; direction?: string; size?: number }
                          } = {}
                          try { config = JSON.parse(field.value || '{}') } catch { /* empty */ }

                          const updateConfig = (updates: Record<string, unknown>) => {
                            const newConfig = { ...config, ...updates }
                            field.onChange(JSON.stringify(newConfig))
                          }

                          return (
                            <>
                              <FormItem>
                                <FormLabel>{t('Animation Type')}</FormLabel>
                                <Select
                                  value={config.animation?.type || 'none'}
                                  onValueChange={(v) =>
                                    updateConfig({
                                      animation: {
                                        type: v,
                                        duration: config.animation?.duration || 8,
                                        direction: config.animation?.direction || 'normal',
                                        size: config.animation?.size || 400,
                                      },
                                    })
                                  }
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value='none'>{t('None')}</SelectItem>
                                    <SelectItem value='flow'>{t('Flow')}</SelectItem>
                                    <SelectItem value='pulse'>{t('Pulse')}</SelectItem>
                                    <SelectItem value='blink'>{t('Blink')}</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormItem>

                              {config.animation?.type && config.animation.type !== 'none' && (
                                <>
                                  <FormItem>
                                    <FormLabel>{t('Duration')}: {config.animation?.duration || 8}s</FormLabel>
                                    <Slider
                                      value={[config.animation?.duration || 8]}
                                      onValueChange={([v]) =>
                                        updateConfig({
                                          animation: { ...config.animation, duration: v },
                                        })
                                      }
                                      min={1}
                                      max={20}
                                      step={1}
                                    />
                                  </FormItem>

                                  <FormItem>
                                    <FormLabel>{t('Direction')}</FormLabel>
                                    <Select
                                      value={config.animation?.direction || 'normal'}
                                      onValueChange={(v) =>
                                        updateConfig({
                                          animation: { ...config.animation, direction: v },
                                        })
                                      }
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value='normal'>{t('Normal')}</SelectItem>
                                        <SelectItem value='reverse'>{t('Reverse')}</SelectItem>
                                        <SelectItem value='alternate'>{t('Alternate')}</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </FormItem>

                                  {config.animation?.type === 'flow' && (
                                    <FormItem>
                                      <FormLabel>{t('Intensity')}: {config.animation?.size || 400}%</FormLabel>
                                      <Slider
                                        value={[config.animation?.size || 400]}
                                        onValueChange={([v]) =>
                                          updateConfig({
                                            animation: { ...config.animation, size: v },
                                          })
                                        }
                                        min={100}
                                        max={800}
                                        step={50}
                                      />
                                    </FormItem>
                                  )}
                                </>
                              )}
                            </>
                          )
                        }}
                      />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value='code' className='mt-4'>
                <Card>
                  <CardHeader>
                    <CardTitle>{t('Custom CSS')}</CardTitle>
                    <CardDescription>
                      {t('Write custom CSS for the banner background. CSS is scoped to .top-banner.')}
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
                    <Input
                      placeholder={t('e.g., #ffffff or white')}
                      {...field}
                    />
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
