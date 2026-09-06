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
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import { createByokKey, updateByokKey } from '../api'
import {
  BYOK_CHANNEL_TYPE_OPTIONS,
  BYOK_MODE_FALLBACK,
  BYOK_MODE_OPTIONS,
  BYOK_MODE_PRIORITIZED,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from '../constants'
import type { ByokKey, ByokKeyFormData } from '../types'

type ByokKeyDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentKey: ByokKey | null
  onSaved: () => void
}

function parseModelListInput(input: string): string[] {
  return input
    .split(/[\n,]/)
    .map((name) => name.trim())
    .filter(Boolean)
}

export function ByokKeyDialog({
  open,
  onOpenChange,
  currentKey,
  onSaved,
}: ByokKeyDialogProps) {
  const { t } = useTranslation()
  const isEditing = currentKey !== null

  const [name, setName] = useState('')
  const [channelType, setChannelType] = useState<number>(
    BYOK_CHANNEL_TYPE_OPTIONS[0].value
  )
  const [key, setKey] = useState('')
  const [mode, setMode] = useState<string>(BYOK_MODE_PRIORITIZED)
  const [modelListInput, setModelListInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    if (currentKey) {
      setName(currentKey.name)
      setChannelType(currentKey.channel_type)
      setKey('')
      setMode(currentKey.mode)
      setModelListInput((currentKey.model_list ? JSON.parse(currentKey.model_list) : []).join('\n'))
    } else {
      setName('')
      setChannelType(BYOK_CHANNEL_TYPE_OPTIONS[0].value)
      setKey('')
      setMode(BYOK_MODE_PRIORITIZED)
      setModelListInput('')
    }
  }, [open, currentKey])

  const handleSubmit = async () => {
    const data: ByokKeyFormData = {
      channel_type: channelType,
      name,
      key,
      mode,
      model_list: parseModelListInput(modelListInput),
    }
    if (!isEditing && !data.key) {
      toast.error(t('BYOK key must not be empty'))
      return
    }
    setIsSubmitting(true)
    try {
      const result = isEditing
        ? await updateByokKey(currentKey.id, data)
        : await createByokKey(data)
      if (result.success) {
        toast.success(
          t(
            isEditing
              ? SUCCESS_MESSAGES.BYOK_KEY_UPDATED
              : SUCCESS_MESSAGES.BYOK_KEY_CREATED
          )
        )
        onOpenChange(false)
        onSaved()
      } else {
        toast.error(result.message || t(ERROR_MESSAGES.UNEXPECTED))
      }
    } catch {
      toast.error(t(ERROR_MESSAGES.UNEXPECTED))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('Edit BYOK Key') : t('Bind BYOK Key')}
          </DialogTitle>
          <DialogDescription>
            {t(
              'Your key is encrypted at rest and only its last 4 characters are shown'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className='grid gap-4 py-2'>
          <div className='grid gap-2'>
            <Label htmlFor='byok-name'>{t('Name')}</Label>
            <Input
              id='byok-name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('Optional display name')}
            />
          </div>

          <div className='grid gap-2'>
            <Label>{t('Provider')}</Label>
            <Select
              value={String(channelType)}
              onValueChange={(value) => setChannelType(Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('Provider')} />
              </SelectTrigger>
              <SelectContent>
                {BYOK_CHANNEL_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='grid gap-2'>
            <Label htmlFor='byok-key'>
              {isEditing ? t('New key (leave empty to keep)') : t('API key')}
            </Label>
            <Input
              id='byok-key'
              type='password'
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder={isEditing ? '••••••••' : 'sk-...'}
              autoComplete='off'
            />
            {isEditing ? (
              <p className='text-muted-foreground text-xs'>
                {t('Current key: {{hint}}', { hint: currentKey?.key_hint })}
              </p>
            ) : null}
          </div>

          <div className='grid gap-2'>
            <Label>{t('Mode')}</Label>
            <Select
              value={mode}
              onValueChange={(value) => setMode(value ?? BYOK_MODE_PRIORITIZED)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('Mode')} />
              </SelectTrigger>
              <SelectContent>
                {BYOK_MODE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {t(option.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className='text-muted-foreground text-xs'>
              {mode === BYOK_MODE_FALLBACK
                ? t('Use your key only after platform channels fail')
                : t('Use your key before platform channels')}
            </p>
          </div>

          <div className='grid gap-2'>
            <Label htmlFor='byok-models'>{t('Model list (optional)')}</Label>
            <Textarea
              id='byok-models'
              value={modelListInput}
              onChange={(e) => setModelListInput(e.target.value)}
              placeholder={'gpt-4o\ngpt-4o-mini'}
              rows={3}
            />
            <p className='text-muted-foreground text-xs'>
              {t(
                'One model per line; listed models can be served even when the platform has no channel for them'
              )}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            {t('Cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? t('Saving...') : t('Save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
