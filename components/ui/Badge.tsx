import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils/cn'

export function Badge({
  className,
  tone = 'neutral',
  ...props
}: ComponentProps<'span'> & { tone?: 'neutral' | 'ink' | 'gold' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11.5px] font-medium',
        tone === 'neutral' && 'bg-sand-100 text-sand-600',
        tone === 'ink' && 'bg-ink-50 text-ink-700',
        tone === 'gold' && 'bg-gold-100 text-gold-700',
        className,
      )}
      {...props}
    />
  )
}
