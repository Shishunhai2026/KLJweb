'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import { BrandMark } from '@/components/layout/BrandMark'
import { PRIMARY_CTA, PRIMARY_NAV } from '@/lib/nav'
import { cn } from '@/lib/utils/cn'

/** 移动端导航抽屉。 */
export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // 点击链接时关闭抽屉，否则跳转后抽屉仍盖在页面上。
  // 不使用 useEffect 监听 pathname：那会造成级联渲染，
  // 而「用户点了链接」本身就是事件，在事件里改状态才是正确的位置。
  const close = () => setOpen(false)

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-lg text-ink-900 transition-colors hover:bg-sand-100 lg:hidden"
          aria-label="打开导航菜单"
        >
          <Menu className="size-5" />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink-950/40 backdrop-blur-sm lg:hidden" />
        <Dialog.Content
          className="fixed inset-y-0 right-0 z-50 flex w-[85vw] max-w-sm flex-col bg-white shadow-xl lg:hidden"
          aria-describedby={undefined}
        >
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-sand-200 px-5">
            <Dialog.Title asChild>
              <span>
                <BrandMark />
              </span>
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                className="flex size-10 items-center justify-center rounded-lg text-sand-600 transition-colors hover:bg-sand-100"
                aria-label="关闭导航菜单"
              >
                <X className="size-5" />
              </button>
            </Dialog.Close>
          </div>

          <nav aria-label="移动端导航" className="flex-1 overflow-y-auto px-3 py-4">
            <ul className="space-y-0.5">
              {PRIMARY_NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={close}
                    className={cn(
                      'block rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors',
                      isActive(item.href)
                        ? 'bg-ink-50 text-ink-900'
                        : 'text-sand-700 hover:bg-sand-50',
                    )}
                  >
                    {item.label}
                  </Link>

                  {item.children ? (
                    <ul className="mb-1 ml-3 space-y-0.5 border-l border-sand-200 pl-3">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            onClick={close}
                            className={cn(
                              'block rounded-md px-3 py-2 text-sm transition-colors',
                              isActive(child.href)
                                ? 'text-ink-800'
                                : 'text-sand-600 hover:bg-sand-50',
                            )}
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          </nav>

          <div className="shrink-0 border-t border-sand-200 p-4">
            <Link
              href={PRIMARY_CTA.href}
              onClick={close}
              className="block rounded-full bg-ink-900 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-ink-950"
            >
              {PRIMARY_CTA.label}
            </Link>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
