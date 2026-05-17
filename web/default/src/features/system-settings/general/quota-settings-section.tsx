import * as z from 'zod'
import type { Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
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
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormDirtyIndicator } from '../components/form-dirty-indicator'
import { FormNavigationGuard } from '../components/form-navigation-guard'
import { SettingsSection } from '../components/settings-section'
import { useSettingsForm } from '../hooks/use-settings-form'
import { useUpdateOption } from '../hooks/use-update-option'
import { getAdminPlans } from '@/features/subscriptions/api'

const quotaSchema = z.object({
  QuotaForNewUser: z.coerce.number().min(0),
  PreConsumedQuota: z.coerce.number().min(0),
  QuotaForInviter: z.coerce.number().min(0),
  QuotaForInvitee: z.coerce.number().min(0),
  InitialSubscriptionPlanId: z.coerce.number().min(0),
  TopUpLink: z.string().url().optional().or(z.literal('')),
  'general_setting.docs_link': z.string().url().optional().or(z.literal('')),
  'quota_setting.enable_free_model_pre_consume': z.boolean(),
})

type QuotaFormValues = z.infer<typeof quotaSchema>

type QuotaSettingsSectionProps = {
  defaultValues: QuotaFormValues
}

export function QuotaSettingsSection({
  defaultValues,
}: QuotaSettingsSectionProps) {
  const { t } = useTranslation()
  const updateOption = useUpdateOption()

  const { data: plansData } = useQuery({
    queryKey: ['admin-subscription-plans'],
    queryFn: async () => {
      const result = await getAdminPlans()
      return result.data || []
    },
  })
  const plans = plansData || []

  const { form, handleSubmit, isDirty, isSubmitting } =
    useSettingsForm<QuotaFormValues>({
      resolver: zodResolver(quotaSchema) as Resolver<
        QuotaFormValues,
        unknown,
        QuotaFormValues
      >,
      defaultValues,
      onSubmit: async (_data, changedFields) => {
        for (const [key, value] of Object.entries(changedFields)) {
          await updateOption.mutateAsync({
            key,
            value: value as string | number | boolean,
          })
        }
      },
    })

  return (
    <SettingsSection
      title={t('Quota Settings')}
      description={t('Configure user quota allocation and rewards')}
    >
      <FormNavigationGuard when={isDirty} />

      <Form {...form}>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <FormDirtyIndicator isDirty={isDirty} />
          <FormField
            control={form.control}
            name='QuotaForNewUser'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('New User Quota')}</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    value={field.value as number}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    name={field.name}
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                </FormControl>
                <FormDescription>
                  {t('Initial quota given to new users')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='PreConsumedQuota'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('Pre-Consumed Quota')}</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    value={field.value as number}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    name={field.name}
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                </FormControl>
                <FormDescription>
                  {t('Quota consumed before charging users')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='QuotaForInviter'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('Inviter Reward')}</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    value={field.value as number}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    name={field.name}
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                </FormControl>
                <FormDescription>
                  {t('Quota given to users who invite others')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='QuotaForInvitee'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('Invitee Reward')}</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    value={field.value as number}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    name={field.name}
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                </FormControl>
                <FormDescription>
                  {t('Quota given to invited users')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='InitialSubscriptionPlanId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('Initial Subscription Plan')}</FormLabel>
                <FormControl>
                  <Select
                    value={String(field.value)}
                    onValueChange={(val) => field.onChange(Number(val))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('None')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='0'>{t('None')}</SelectItem>
                      {plans.map((item) => (
                        <SelectItem
                          key={item.plan.id}
                          value={String(item.plan.id)}
                        >
                          {item.plan.title}
                          {!item.plan.enabled && ` (${t('Disabled')})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>
                  {t(
                    'Automatically bind this subscription plan to new users upon registration'
                  )}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='quota_setting.enable_free_model_pre_consume'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                <div className='space-y-0.5'>
                  <FormLabel className='text-base'>
                    {t('Pre-Consume for Free Models')}
                  </FormLabel>
                  <FormDescription>
                    {t(
                      'When enabled, zero-cost models also pre-consume quota before final settlement.'
                    )}
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={updateOption.isPending}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='TopUpLink'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('Top-Up Link')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('https://example.com/topup')}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  {t('External link for users to purchase quota')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='general_setting.docs_link'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('Documentation Link')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('https://docs.example.com')}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  {t('Link to your documentation site')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type='submit'
            disabled={updateOption.isPending || isSubmitting}
          >
            {updateOption.isPending ? t('Saving...') : t('Save Changes')}
          </Button>
        </form>
      </Form>
    </SettingsSection>
  )
}
