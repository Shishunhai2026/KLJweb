import { Moon } from 'lucide-react'

import { SITE } from '@/lib/seo/site'
import { cn } from '@/lib/utils/cn'

/**
 * 品牌标识。
 *
 * 用文字 + 图标组合而非位图 logo：在任意分辨率下都清晰，
 * 且不会因为 logo 图片加载失败而出现空白页头。
 * 拿到正式 logo 文件后替换这里即可，页头与页脚会自动同步。
 */
export function BrandMark({
  className,
  tone = 'dark',
}: {
  className?: string
  /** dark = 深色文字用于浅色背景；light = 浅色文字用于深色背景 */
  tone?: 'dark' | 'light'
}) {
  return (
    <span className={cn('flex items-center gap-2', className)}>
      <span
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-lg',
          tone === 'dark' ? 'bg-ink-900 text-gold-300' : 'bg-white/10 text-gold-300',
        )}
        aria-hidden="true"
      >
        <Moon className="size-4.5" strokeWidth={2} />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            'text-[15px] font-bold tracking-tight',
            tone === 'dark' ? 'text-ink-950' : 'text-white',
          )}
        >
          {SITE.name}
        </span>
        <span
          className={cn(
            'mt-0.5 text-[10px] font-medium tracking-wider',
            tone === 'dark' ? 'text-sand-500' : 'text-ink-200',
          )}
        >
          睡眠健康知识平台
        </span>
      </span>
    </span>
  )
}
