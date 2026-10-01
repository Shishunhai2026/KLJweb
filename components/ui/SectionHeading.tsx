import type { ReactNode } from 'react'

import { cn } from '@/lib/utils/cn'

/**
 * 区块标题。
 *
 * `level` 控制渲染成 h2 还是 h3 —— 每个页面必须只有一个 h1，
 * 区块标题的层级需要在编写页面时显式指定，而不是随手用 h2。
 */
export function SectionHeading({
  title,
  description,
  action,
  level = 2,
  className,
}: {
  title: string
  description?: string
  action?: ReactNode
  level?: 2 | 3
  className?: string
}) {
  const Tag = level === 2 ? 'h2' : 'h3'

  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-4', className)}>
      <div>
        <Tag
          className={cn(
            'font-bold tracking-tight text-ink-950',
            level === 2 ? 'text-xl sm:text-2xl' : 'text-lg',
          )}
        >
          {title}
        </Tag>
        {description ? (
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-sand-600">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
