import { useTranslation } from 'react-i18next'
import { stringToColor } from '@/lib/colors'
import { Badge, type BadgeColor } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { ModelAvailability } from '../types'

function getAvailabilityBadgeColor(availability: number): BadgeColor {
  if (availability >= 95) return 'success'
  if (availability >= 80) return 'warning'
  return 'danger'
}

export function AvailabilityTable({ data }: { data: ModelAvailability[] }) {
  const { t } = useTranslation()

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('Channel Provider')}</TableHead>
            <TableHead>{t('Model ID')}</TableHead>
            <TableHead className='w-[300px]'>{t('Availability')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className='h-24 text-center text-muted-foreground'>
                {t('No data available')}
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => {
              const primaryChannel = item.channels[0]
              const hasMultipleChannels = item.channels.length > 1

              return (
                <TableRow key={item.model_name}>
                  <TableCell>
                    {primaryChannel ? (
                      hasMultipleChannels ? (
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span>
                                <Badge color={stringToColor(primaryChannel.channel_name) as BadgeColor}>
                                  {primaryChannel.channel_name}
                                </Badge>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side='top' className='max-w-xs'>
                              <div className='flex flex-wrap gap-1'>
                                {item.channels.map((ch) => (
                                  <Badge key={ch.channel_id} color={stringToColor(ch.channel_name) as BadgeColor}>
                                    {ch.channel_name}
                                  </Badge>
                                ))}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <Badge color={stringToColor(primaryChannel.channel_name) as BadgeColor}>
                          {primaryChannel.channel_name}
                        </Badge>
                      )
                    ) : (
                      <span className='text-muted-foreground'>-</span>
                    )}
                  </TableCell>
                  <TableCell className='font-mono text-sm'>
                    {item.model_name}
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-3'>
                      <Progress
                        value={item.availability}
                        className='h-2 flex-1'
                      />
                      <Badge color={getAvailabilityBadgeColor(item.availability)} className='w-16 justify-center tabular-nums'>
                        {item.availability.toFixed(1)}%
                      </Badge>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
