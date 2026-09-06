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
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { SectionPageLayout } from '@/components/layout'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

import { deleteByokKey, getByokKeys, getByokStatus } from './api'
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from './constants'
import { ByokKeyDialog } from './components/byok-key-dialog'
import { ByokTable } from './components/byok-table'
import type { ByokKey } from './types'

export function Byok() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingKey, setEditingKey] = useState<ByokKey | null>(null)
  const [deletingKey, setDeletingKey] = useState<ByokKey | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const { data: statusData } = useQuery({
    queryKey: ['byok-status'],
    queryFn: getByokStatus,
  })

  const {
    data: keysData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['byok-keys'],
    queryFn: getByokKeys,
  })

  const status = statusData?.data
  const keys = keysData?.data ?? []

  let statusHint: ReactNode = null
  if (status && !status.enabled) {
    statusHint = (
      <p className='text-muted-foreground mb-4 text-sm'>
        {t(
          'BYOK is currently disabled by the administrator; bound keys are kept but not used'
        )}
      </p>
    )
  } else if (status) {
    statusHint = (
      <p className='text-muted-foreground mb-4 text-sm'>
        {status.service_fee_usd > 0
          ? t('Service fee: ${{fee}} per request', {
              fee: status.service_fee_usd,
            })
          : t('BYOK requests are currently free of service fees')}
      </p>
    )
  }

  const handleSaved = () => {
    void refetch()
    void queryClient.invalidateQueries({ queryKey: ['byok-status'] })
  }

  const handleDelete = async () => {
    if (!deletingKey) return
    setIsDeleting(true)
    try {
      const result = await deleteByokKey(deletingKey.id)
      if (result.success) {
        toast.success(t(SUCCESS_MESSAGES.BYOK_KEY_DELETED))
        setDeletingKey(null)
        handleSaved()
      } else {
        toast.error(result.message || t(ERROR_MESSAGES.UNEXPECTED))
      }
    } catch {
      toast.error(t(ERROR_MESSAGES.UNEXPECTED))
    } finally {
      setIsDeleting(false)
    }
  }

  let content: ReactNode
  if (isLoading) {
    content = (
      <div className='flex justify-center py-12'>
        <Spinner />
      </div>
    )
  } else if (isError) {
    content = (
      <div className='py-12 text-center'>
        <p className='text-muted-foreground mb-4 text-sm'>
          {t(ERROR_MESSAGES.LOAD_FAILED)}
        </p>
        <Button variant='outline' onClick={() => void refetch()}>
          {t('Retry')}
        </Button>
      </div>
    )
  } else if (keys.length === 0) {
    content = (
      <p className='text-muted-foreground py-12 text-center text-sm'>
        {t(
          'No BYOK keys yet. Bind your own provider key to use it through this gateway'
        )}
      </p>
    )
  } else {
    content = (
      <ByokTable
        keys={keys}
        onEdit={(key) => {
          setEditingKey(key)
          setDialogOpen(true)
        }}
        onDelete={setDeletingKey}
      />
    )
  }

  return (
    <SectionPageLayout>
      <SectionPageLayout.Title>{t('BYOK')}</SectionPageLayout.Title>
      <SectionPageLayout.Actions>
        <Button
          onClick={() => {
            setEditingKey(null)
            setDialogOpen(true)
          }}
        >
          <Plus />
          {t('Bind BYOK Key')}
        </Button>
      </SectionPageLayout.Actions>
      <SectionPageLayout.Content>
        {statusHint}
        {content}
      </SectionPageLayout.Content>

      <ByokKeyDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        currentKey={editingKey}
        onSaved={handleSaved}
      />

      <AlertDialog
        open={deletingKey !== null}
        onOpenChange={(open) => !open && setDeletingKey(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('Are you sure?')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('This will permanently delete BYOK key')}{' '}
              <span className='font-semibold'>{deletingKey?.name}</span>
              {t('. This action cannot be undone.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t('Cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              variant='destructive'
            >
              {isDeleting ? t('Deleting...') : t('Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SectionPageLayout>
  )
}
