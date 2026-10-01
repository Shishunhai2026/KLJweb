import Link from 'next/link'
import { ChevronDown } from 'lucide-react'

import { Container } from '@/components/layout/Container'
import { MobileNav } from '@/components/layout/MobileNav'
import { BrandMark } from '@/components/layout/BrandMark'
import { PRIMARY_CTA, PRIMARY_NAV } from '@/lib/nav'

/**
 * 页头。
 *
 * 刻意做成服务端组件：导航链接必须出现在首屏 HTML 里，
 * 百度对 JavaScript 渲染的支持有限，导航靠 hydration 才出现会显著影响抓取。
 * 只有移动端抽屉需要交互，单独拆成客户端组件。
 *
 * 下拉菜单用 CSS 的 group-hover / group-focus-within 实现，
 * 不发一个字节的 JS，键盘可达性也由 focus-within 天然保证。
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-sand-200 bg-white/90 backdrop-blur-md">
      <Container size="wide">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="shrink-0" aria-label="返回首页">
            <BrandMark />
          </Link>

          {/* 桌面导航 */}
          <nav aria-label="主导航" className="hidden lg:block">
            <ul className="flex items-center gap-0.5">
              {PRIMARY_NAV.map((item) => (
                <li key={item.href} className="group relative">
                  <Link
                    href={item.href}
                    className="flex items-center gap-1 rounded-md px-3 py-2 text-[13.5px] font-medium text-sand-700 transition-colors hover:bg-sand-100 hover:text-ink-900"
                  >
                    {item.label}
                    {item.children ? (
                      <ChevronDown
                        className="size-3.5 text-sand-400 transition-transform group-hover:rotate-180"
                        aria-hidden="true"
                      />
                    ) : null}
                  </Link>

                  {item.children ? (
                    /* pt-2 作为鼠标移出目标与下拉菜单之间的“桥”，避免移动过程中菜单消失 */
                    <div className="invisible absolute left-0 top-full z-50 pt-2 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                      <ul className="w-72 rounded-xl border border-sand-200 bg-white p-2 shadow-card-hover">
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className="block rounded-lg px-3 py-2.5 transition-colors hover:bg-sand-50"
                            >
                              <span className="block text-[13.5px] font-medium text-ink-900">
                                {child.label}
                              </span>
                              {child.description ? (
                                <span className="mt-0.5 block text-xs leading-relaxed text-sand-500">
                                  {child.description}
                                </span>
                              ) : null}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href={PRIMARY_CTA.href}
              className="hidden rounded-full bg-ink-900 px-4 py-2 text-[13.5px] font-semibold text-white transition-colors hover:bg-ink-950 sm:inline-flex"
            >
              {PRIMARY_CTA.label}
            </Link>
            <MobileNav />
          </div>
        </div>
      </Container>
    </header>
  )
}
