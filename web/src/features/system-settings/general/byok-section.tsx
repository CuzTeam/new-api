/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import * as z from 'zod'

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
  SettingsForm,
  SettingsSwitchContent,
  SettingsSwitchItem,
} from '../components/settings-form-layout'
import { SettingsPageFormActions } from '../components/settings-page-context'
import { SettingsSection } from '../components/settings-section'
import { useResetForm } from '../hooks/use-reset-form'
import { useUpdateOption } from '../hooks/use-update-option'

// The error string doubles as an i18n key; FormMessage wraps it with t().
const byokSchema = z.object({
  ByokEnabled: z.boolean(),
  ByokServiceFeeUSD: z
    .string()
    .trim()
    .refine((value) => {
      const fee = Number(value)
      return value !== '' && Number.isFinite(fee) && fee >= 0 && fee <= 100
    }, { error: 'Enter a service fee between 0 and 100' }),
})

type ByokFormValues = z.infer<typeof byokSchema>

type ByokSectionProps = {
  defaultValues: ByokFormValues
}

export function ByokSection({ defaultValues }: ByokSectionProps) {
  const { t } = useTranslation()
  const updateOption = useUpdateOption()

  const form = useForm({
    resolver: zodResolver(byokSchema),
    defaultValues,
  })

  useResetForm(form, defaultValues)

  const onSubmit = async (data: ByokFormValues) => {
    const enableChanged = data.ByokEnabled !== defaultValues.ByokEnabled
    const feeChanged = data.ByokServiceFeeUSD !== defaultValues.ByokServiceFeeUSD

    // Order the paired writes so no intermediate state lets requests bypass
    // the service fee: persist the fee before enabling BYOK, and disable
    // BYOK before changing the fee.
    if (enableChanged && data.ByokEnabled) {
      if (feeChanged) {
        await updateOption.mutateAsync({
          key: 'ByokServiceFeeUSD',
          value: data.ByokServiceFeeUSD,
        })
      }
      await updateOption.mutateAsync({ key: 'ByokEnabled', value: 'true' })
    } else if (enableChanged) {
      await updateOption.mutateAsync({ key: 'ByokEnabled', value: 'false' })
      if (feeChanged) {
        await updateOption.mutateAsync({
          key: 'ByokServiceFeeUSD',
          value: data.ByokServiceFeeUSD,
        })
      }
    } else if (feeChanged) {
      await updateOption.mutateAsync({
        key: 'ByokServiceFeeUSD',
        value: data.ByokServiceFeeUSD,
      })
    }
  }

  return (
    <SettingsSection title='BYOK'>
      <Form {...form}>
        <SettingsForm onSubmit={form.handleSubmit(onSubmit)}>
          <SettingsPageFormActions
            onSave={form.handleSubmit(onSubmit)}
            isSaving={updateOption.isPending}
          />
          <FormField
            control={form.control}
            name='ByokEnabled'
            render={({ field }) => (
              <SettingsSwitchItem>
                <SettingsSwitchContent>
                  <FormLabel>{t('Enable BYOK')}</FormLabel>
                  <FormDescription>
                    {t(
                      'Allow users to serve requests with their own provider keys. When disabled, both prioritized and fallback BYOK attempts are skipped'
                    )}
                  </FormDescription>
                </SettingsSwitchContent>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </SettingsSwitchItem>
            )}
          />

          <FormField
            control={form.control}
            name='ByokServiceFeeUSD'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('BYOK service fee (USD per request)')}</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    step='0.0001'
                    min={0}
                    max={100}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  {t(
                    'Flat fee charged per request served by a user key. Set 0 to make BYOK free'
                  )}
                </FormDescription>
                <FormMessage>
                  {form.formState.errors.ByokServiceFeeUSD?.message
                    ? t(form.formState.errors.ByokServiceFeeUSD.message)
                    : undefined}
                </FormMessage>
              </FormItem>
            )}
          />
        </SettingsForm>
      </Form>
    </SettingsSection>
  )
}
