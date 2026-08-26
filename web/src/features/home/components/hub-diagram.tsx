/*
Copyright (C) 2026 Cuz Technology

This file is part of New API. New API is free software: you can
redistribute it and/or modify it under the terms of the GNU Affero
General Public License as published by the Free Software Foundation,
either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.
*/
import { Logo } from '@/assets/logo'
import { getLobeIcon } from '@/lib/lobe-icon'
import { cn } from '@/lib/utils'

const LLM_ICONS = [
  'OpenAI',
  'Claude.Color',
  'Gemini.Color',
  'DeepSeek.Color',
  'Qwen.Color',
  'ChatGLM.Color',
  'Grok',
  'Mistral.Color',
  'Meta.Color',
  'Kimi.Color',
  'Doubao.Color',
  'Minimax.Color',
] as const

const DEV_ICONS = [
  { name: 'Cursor', y: 39 },
  { name: 'GithubCopilot', y: 134 },
  { name: 'Trae.Color', y: 229 },
  { name: 'Codex.Color', y: 324 },
] as const

/** Right-side fan-out curve colors, one per dev tool icon. */
const CURVE_COLORS = ['#60a5fa', '#fb7185', '#fbbf24', '#2dd4bf']

// Stage geometry (px); the SVG overlay shares this 400x420 coordinate space.
const STAGE_WIDTH = 400
const STAGE_HEIGHT = 420
const PILL_RIGHT = 72
const HUB_LEFT = 168
const HUB_RIGHT = 232
const HUB_CENTER_Y = 210
const ICON_LEFT = 328

interface HubDiagramProps {
  className?: string
}

/**
 * Zeabur-style routing diagram: an infinitely scrolling pill of LLM provider
 * icons on the left converges into the New API hub, then fans out through
 * colored bezier curves to developer tools on the right. Decorative only.
 */
export function HubDiagram({ className }: HubDiagramProps) {
  return (
    <div
      aria-hidden='true'
      className={cn(
        'dark relative overflow-hidden rounded-[2rem] bg-neutral-950 shadow-xl ring-1 ring-black/10 dark:bg-[#151515] dark:ring-white/10',
        className
      )}
    >
      <div
        className='relative mx-auto'
        style={{ width: STAGE_WIDTH, height: STAGE_HEIGHT }}
      >
        {/* Connection overlay: straight in-feed + colored fan-out curves */}
        <svg
          className='absolute inset-0 h-full w-full'
          viewBox={`0 0 ${STAGE_WIDTH} ${STAGE_HEIGHT}`}
          fill='none'
        >
          <line
            x1={PILL_RIGHT}
            y1={HUB_CENTER_Y}
            x2={HUB_LEFT}
            y2={HUB_CENTER_Y}
            stroke='currentColor'
            strokeWidth={1.5}
            className='text-white/20'
          />
          {DEV_ICONS.map((icon, i) => {
            const yc = icon.y + 28
            return (
              <path
                key={icon.name}
                d={`M ${HUB_RIGHT} ${HUB_CENTER_Y} C ${HUB_RIGHT + 42} ${HUB_CENTER_Y} ${ICON_LEFT - 42} ${yc} ${ICON_LEFT} ${yc}`}
                stroke={CURVE_COLORS[i]}
                strokeOpacity={0.65}
                strokeWidth={1.5}
              />
            )
          })}
        </svg>

        {/* Left: infinitely scrolling LLM icon pill */}
        <div className='scroll-container absolute top-[50px] bottom-[50px] left-4 w-14 overflow-hidden rounded-full border border-white/10 bg-white/[0.04] [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)]'>
          <div className='animate-scroll-down flex flex-col items-center gap-6 py-3'>
            {[...LLM_ICONS, ...LLM_ICONS].map((iconName, i) => (
              // oxlint-disable-next-line react/no-array-index-key
              <span key={`${iconName}-${i}`} className='shrink-0 text-white'>
                {getLobeIcon(iconName, 26)}
              </span>
            ))}
          </div>
        </div>

        {/* Center: New API hub */}
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
          <div className='absolute -inset-5 rounded-full bg-[#7300ff]/25 blur-2xl' />
          <div className='relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-neutral-900 shadow-lg'>
            <Logo className='size-8' />
          </div>
        </div>

        {/* Right: developer tool icons */}
        {DEV_ICONS.map((icon) => (
          <div
            key={icon.name}
            className='absolute flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white'
            style={{ left: ICON_LEFT, top: icon.y }}
          >
            {getLobeIcon(icon.name, 26)}
          </div>
        ))}
      </div>
    </div>
  )
}
