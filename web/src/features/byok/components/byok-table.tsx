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
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import {
  BYOK_CHANNEL_TYPE_OPTIONS,
  BYOK_MODE_OPTIONS,
  BYOK_STATUS_OPTIONS,
} from '../constants'
import type { ByokKey } from '../types'

type ByokTableProps = {
  keys: ByokKey[]
  onEdit: (key: ByokKey) => void
  onDelete: (key: ByokKey) => void
}

function formatTimestamp(seconds: number): string {
  if (!seconds) return '-'
  const date = new Date(seconds * 1000)
  return date.toLocaleString()
}

export function ByokTable({ keys, onEdit, onDelete }: ByokTableProps) {
  const { t } = useTranslation()

  const channelLabel = (channelType: number) =>
    BYOK_CHANNEL_TYPE_OPTIONS.find((option) => option.value === channelType)
      ?.label ?? String(channelType)

  const modeLabel = (mode: string) =>
    t(
      BYOK_MODE_OPTIONS.find((option) => option.value === mode)?.labelKey ??
        mode
    )

  const statusBadge = (status: number) => {
    const option = BYOK_STATUS_OPTIONS.find((item) => item.value === status)
    return (
      <Badge variant={option?.tone === 'danger' ? 'destructive' : 'secondary'}>
        {t(option?.labelKey ?? String(status))}
      </Badge>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('Name')}</TableHead>
          <TableHead>{t('Provider')}</TableHead>
          <TableHead>{t('Key')}</TableHead>
          <TableHead>{t('Mode')}</TableHead>
          <TableHead>{t('Models')}</TableHead>
          <TableHead>{t('Status')}</TableHead>
          <TableHead>{t('Last used')}</TableHead>
          <TableHead className='text-right'>{t('Actions')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {keys.map((key) => (
          <TableRow key={key.id}>
            <TableCell className='font-medium'>
              {key.name || t('Unnamed')}
            </TableCell>
            <TableCell>{channelLabel(key.channel_type)}</TableCell>
            <TableCell className='font-mono'>{key.key_hint}</TableCell>
            <TableCell>{modeLabel(key.mode)}</TableCell>
            <TableCell className='max-w-48 truncate'>
              {key.model_list && key.model_list !== '[]'
                ? (JSON.parse(key.model_list) as string[]).join(', ')
                : t('All of this provider')}
            </TableCell>
            <TableCell>{statusBadge(key.status)}</TableCell>
            <TableCell>{formatTimestamp(key.accessed_time)}</TableCell>
            <TableCell className='text-right'>
              <div className='flex justify-end gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => onEdit(key)}
                >
                  {t('Edit')}
                </Button>
                <Button
                  variant='destructive'
                  size='sm'
                  onClick={() => onDelete(key)}
                >
                  {t('Delete')}
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
