'use client'

import { Play } from 'lucide-react'
import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils/cn'

/**
 * 首屏轮播背景。
 *
 * 只做「背景层」：绝对定位铺满 Hero，真正的标题与 CTA 由服务端组件渲染在其上方，
 * 这样首屏文案始终在 HTML 里，不依赖 hydration（百度抓取友好）。
 *
 * 五张图都是客户提供的营销物料（公众号「企业宣传资料」性质），
 * 图内自带文字与功效表述已由需求方确认原样使用；此处 alt 只做中性的产品描述，
 * 不重复图内任何功效措辞。
 *
 * 5 号（睡眠专利）为 2026-10-01 需求方追加，沿用 1–4 号同一份知情确认：
 * 图内「八项睡眠相关专利」「未含 22 种安眠药成分」属企业宣传表述，
 * 与站内证据分级规则冲突，仅在首屏原样展示，不得复用到其他页面正文。
 *
 * 点击整屏可暂停/继续轮播。自动轮播属于 WCAG 2.2.2「自动更新内容」，
 * 必须提供暂停机制；顺带满足「想看清某张图」的常规诉求。
 * 焦点环在 globals.css 里是全站深色 ink-600，压在这张深色 banner 上看不见，
 * 因此这里单独换成白色并内收——不要删掉那段 focus-visible。
 */
interface Slide {
  src: string
  alt: string
}

const SLIDES: readonly Slide[] = [
  { src: '/images/hero/sod-molecule.webp', alt: '和颐林睡眠大师产品与 SOD 植物复合酶配方展示' },
  { src: '/images/hero/light-lifestyle.webp', alt: '和颐林睡眠大师产品展示' },
  { src: '/images/hero/plant-nutrition.webp', alt: '和颐林睡眠大师九种植物营养成分展示' },
  { src: '/images/hero/good-sleep.webp', alt: '和颐林睡眠大师产品与夜间休息场景展示' },
  { src: '/images/hero/sleep-patents.webp', alt: '和颐林睡眠大师产品与专利资料展示' },
]

/** 需求指定：每 2 秒切换一张。 */
const INTERVAL_MS = 2000

export function HeroCarousel() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    /*
     * 暂停时直接不挂 interval，而不是挂着再跳过 tick：
     * 后者会在恢复的那一刻立刻跳一张，看起来像「漏了一拍」。
     * 不挂的话，恢复后总是完整走满 2 秒才切下一张。
     */
    if (paused) return

    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % SLIDES.length)
    }, INTERVAL_MS)

    return () => window.clearInterval(timer)
  }, [paused])

  return (
    <div className="absolute inset-0 overflow-hidden bg-ink-950">
      {/*
        画面层：纯装饰（图内自带文案，不参与语义），单独圈出来对读屏隐藏。
        不要把 aria-hidden 提到外层容器上——那样会把下面的暂停按钮一起藏掉，
        按钮就成了读屏和键盘都够不着的「幽灵控件」。
      */}
      <div aria-hidden="true" className="absolute inset-0">
        {SLIDES.map((slide, index) => {
          const isActive = index === active

          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={slide.src}
              src={slide.src}
              alt=""
              /*
               * Hero 容器已锁死为产物的 2.88:1，这里实际是零裁切。
               * 仍写 object-cover 而不是 fill：一旦有人改动了容器比例，
               * 宁可裁边也不要拉伸，图内文字被压变形比被裁掉更难接受。
               */
              className={cn(
                'absolute inset-0 size-full object-cover object-center',
                'transition-opacity ease-in-out motion-reduce:transition-none',
                'duration-700',
                isActive ? 'opacity-100' : 'opacity-0',
              )}
              /* 首屏图，必须尽早进入视口：第一张立即加载，其余等首屏稳定后再拉 */
              loading={index === 0 ? 'eager' : 'lazy'}
              fetchPriority={index === 0 ? 'high' : 'low'}
              decoding="async"
              width={1600}
              height={556}
            />
          )
        })}
      </div>

      {/*
        暂停控件：整屏铺满的透明按钮。
        用真 button 而不是给容器挂 onClick——键盘 Tab 能聚焦、回车/空格能触发、
        读屏能念出状态，这些都是原生按钮白送的。焦点环必须留在可见范围内，
        否则键盘用户 Tab 进首屏会「不知道焦点在哪」。
      */}
      <button
        type="button"
        onClick={() => setPaused((current) => !current)}
        aria-label={paused ? '继续轮播首屏图片' : '暂停轮播首屏图片'}
        title={paused ? '继续轮播' : '暂停轮播'}
        className={cn(
          'absolute inset-0 z-10 cursor-pointer',
          // 兜底清掉 button 的 UA 默认样式，保证它真的是「透明的一层」
          'appearance-none border-0 bg-transparent p-0',
          // 全站深色焦点环在这张深色 banner 上看不见，换成白色并向内收
          'focus-visible:outline-white focus-visible:-outline-offset-4',
        )}
      />

      {/*
        暂停后的提示。图内文案不叠加是首屏的硬规则，所以这里只给一个图标，
        不加「已暂停」字样；语义由上面按钮的 aria-label 承担。
        pointer-events-none 让点击穿透到按钮，点徽标本身也能继续。
      */}
      {paused ? (
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute right-4 bottom-4 z-20',
            'inline-flex size-8 items-center justify-center rounded-full sm:size-9',
            'bg-ink-950/55 text-white backdrop-blur-sm',
          )}
        >
          <Play className="size-3.5 fill-current" aria-hidden="true" />
        </span>
      ) : null}
    </div>
  )
}
