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
import { ChevronsUpDown } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export type ModelOption = {
  permaslug: string
  name: string
}

type ModelMultiSelectProps = {
  options: ModelOption[]
  selected: string[]
  onChange: (selected: string[]) => void
}

/**
 * Searchable multi-select dropdown of models, mirroring the "N selected"
 * picker above the comparison charts on the source site. Selection order
 * follows the option order so charts stay in leaderboard order.
 */
export function ModelMultiSelect(props: ModelMultiSelectProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const selectedSet = new Set(props.selected)

  const toggle = (permaslug: string) => {
    if (selectedSet.has(permaslug)) {
      props.onChange(props.selected.filter((slug) => slug !== permaslug))
      return
    }
    const next = props.options
      .filter(
        (option) =>
          selectedSet.has(option.permaslug) || option.permaslug === permaslug
      )
      .map((option) => option.permaslug)
    props.onChange(next)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant='outline'
            aria-expanded={open}
            aria-label={t('Select models to compare')}
            className='w-52 justify-between font-normal'
          />
        }
      >
        <span className='truncate'>
          {t('{{count}} selected', { count: props.selected.length })}
        </span>
        <ChevronsUpDown
          aria-hidden
          className='text-muted-foreground size-4 shrink-0'
        />
      </PopoverTrigger>
      <PopoverContent align='start' className='w-72 p-0'>
        <Command>
          <CommandInput placeholder={t('Search models...')} />
          <CommandList className='max-h-72'>
            <CommandEmpty>{t('No models found')}</CommandEmpty>
            <CommandGroup>
              {props.options.map((option) => {
                const checked = selectedSet.has(option.permaslug)
                return (
                  <CommandItem
                    key={option.permaslug}
                    value={option.name}
                    onSelect={() => toggle(option.permaslug)}
                    className='flex items-center gap-2'
                  >
                    <Checkbox
                      checked={checked}
                      aria-label={option.name}
                      className='pointer-events-none'
                    />
                    <span className='truncate'>{option.name}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
