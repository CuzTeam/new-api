'use client'

import { type ComponentProps, memo } from 'react'
import { Streamdown } from 'streamdown'
import { cn } from '@/lib/utils'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'
import { normalizeMathDelimiters } from '@/lib/markdown-math'
import 'katex/dist/katex.min.css'

type ResponseProps = ComponentProps<typeof Streamdown>

export const Response = memo(
  ({ className, children, ...props }: ResponseProps) => {
    const stripCustomTags = (input: unknown): unknown => {
      if (typeof input !== 'string') return input
      return (
        input
          // Remove known AI custom wrapper tags but keep inner content
          .replace(
            /<\/?(conversation|conversationcontent|reasoning|reasoningcontent|reasoningtrigger|sources|sourcescontent|sourcestrigger|branch|branchmessages|branchnext|branchpage|branchprevious|branchselector|message|messagecontent)\b[^>]*>/gi,
            ''
          )
          // Remove any stray <think> tags if they still appear
          .replace(/<\/?think\b[^>]*>/gi, '')
      )
    }

    const safeChildren = stripCustomTags(children) as string
    const normalizedChildren =
      typeof safeChildren === 'string'
        ? normalizeMathDelimiters(safeChildren)
        : safeChildren

    return (
      <Streamdown
        className={cn(
          'size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
          className
        )}
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        {...props}
      >
        {normalizedChildren}
      </Streamdown>
    )
  },
  (prevProps, nextProps) => prevProps.children === nextProps.children
)

Response.displayName = 'Response'
