import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils/cn'

export function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('rounded-card border border-sand-200 bg-white p-5 shadow-card', className)}
      {...props}
    />
  )
}

/** 整卡可点击的卡片，用于列表项。 */
export function CardLink({ className, ...props }: ComponentProps<'a'>) {
  return (
    <a
      className={cn(
        'block rounded-card border border-sand-200 bg-white p-5 shadow-card transition-all',
        'hover:-translate-y-0.5 hover:border-ink-200 hover:shadow-card-hover',
        className,
      )}
      {...props}
    />
  )
}
