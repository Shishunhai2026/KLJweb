import { cva, type VariantProps } from 'class-variance-authority'
import Link from 'next/link'
import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils/cn'

const buttonStyles = cva(
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        /** 主操作：深蓝实心 */
        primary: 'bg-ink-900 text-white hover:bg-ink-950',
        /** 次要操作：描边 */
        secondary: 'border border-sand-300 bg-white text-ink-900 hover:border-ink-300 hover:bg-ink-50',
        /** 强调：暖金，用于页脚等深色背景 */
        gold: 'bg-gold-400 text-ink-950 hover:bg-gold-300',
        /** 深色背景上的浅色按钮 */
        onDark: 'bg-white text-ink-950 hover:bg-ink-100',
        /** 文字按钮 */
        ghost: 'text-ink-700 hover:bg-sand-100 hover:text-ink-900',
      },
      size: {
        sm: 'px-3.5 py-1.5 text-[13px]',
        md: 'px-5 py-2.5 text-[14px]',
        lg: 'px-7 py-3.5 text-[15px]',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

type ButtonStyleProps = VariantProps<typeof buttonStyles>

export function Button({
  className,
  variant,
  size,
  ...props
}: ComponentProps<'button'> & ButtonStyleProps) {
  return <button className={cn(buttonStyles({ variant, size }), className)} {...props} />
}

/** 链接形态的按钮。站内链接一律使用。 */
export function ButtonLink({
  className,
  variant,
  size,
  href,
  ...props
}: ComponentProps<typeof Link> & ButtonStyleProps) {
  return <Link href={href} className={cn(buttonStyles({ variant, size }), className)} {...props} />
}

export { buttonStyles }
