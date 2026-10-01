import { ArrowRight, ClipboardCheck } from 'lucide-react'
import Link from 'next/link'

import { Container } from '@/components/layout/Container'
import { PRIMARY_CTA } from '@/lib/nav'

/**
 * 首页第二屏：站内自己的主标题与两个 CTA（原文档 §5.1 的首屏文案）。
 *
 * 轮播 banner 启用后，这一屏从「第一屏」整体下移至此，文案保持原样。
 *
 * 背景是**从左到右、由第一屏的深色调渐变到第一屏的浅色调**（bg-sky-gradient）：
 * 左侧深色调托住文字，右侧浅色调落在文字块之外的留白里。
 * 两端取自轮播 banner 的实际色调（banner-deep / banner-light），
 * 所以这一屏是首屏画面的延续，不是另配的一块蓝。
 *
 * ⚠️ 四处不能随手改：
 *   1. 文字必须是**浅色系**。文字块贴在左侧的深色段上，换成深色文字直接看不见
 *      （曾有一版改成浅蓝底 + 深色字，那是深色段挪到别处之后才能成立）。
 *   2. 渐变的分档写在 globals.css（`bg-sky-gradient`），小屏与大屏是两套：
 *      小屏文字几乎铺满整行，浅色调只能收在最右侧的窄条里；大屏右侧留白充足，
 *      才展开到完整的 banner-light。改任一处都要同时验证正文对比度。
 *   3. 右上角那团金色光晕的**不透明度必须压得很低**（当前 15%）。它正好盖在
 *      右侧的浅色调上，之前 30% 时实测把右端蓝通道冲掉 22 点，浅蓝整个变灰。
 *      要加暖意就调位置或缩小，不要调高不透明度。
 *   4. 下内边距（pb-14 起）保留，它撑起这一屏的高度；
 *      渐变改成横向后，它不再承担「把浅色推到文字下方」的职责。
 */
export function HeroIntro() {
  return (
    <section className="relative overflow-hidden bg-sky-gradient">
      {/* 装饰性光晕，纯 CSS，不占用图片请求 */}
      {/* 金色「阳光」：刻意压到 15%，再高就会把右端的海洋淡蓝冲成灰蓝（见上方注释 3） */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-28 size-[22rem] rounded-full opacity-15 blur-3xl"
        style={{ background: 'radial-gradient(circle, #d9a94b 0%, transparent 68%)' }}
      />
      {/* 深蓝侧的一层薄辉，给左侧的深邃天空加一点纵深 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-28 size-[24rem] rounded-full opacity-18 blur-3xl"
        style={{ background: 'radial-gradient(circle, #4585bd 0%, transparent 70%)' }}
      />

      <Container size="wide" className="relative">
        <div className="max-w-3xl pt-8 pb-14 sm:pt-9 sm:pb-16 lg:pt-10 lg:pb-20">
          <p className="text-[11px] font-medium tracking-[0.18em] text-gold-300">
            和颐林 · 睡眠健康知识平台
          </p>

          <h1 className="mt-2.5 text-[1.5rem] font-bold leading-[1.2] tracking-tight text-white sm:text-[1.75rem] lg:text-[2rem]">
            睡不好，不只是「缺觉」
          </h1>

          <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-ink-200 sm:text-[13.5px]">
            从了解睡眠开始，认识自己的睡眠问题，找到更适合自己的改善方向。
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <Link
              href={PRIMARY_CTA.href}
              className="inline-flex items-center gap-2 rounded-full bg-gold-400 px-5 py-2.5 text-[13px] font-semibold text-ink-950 transition-colors hover:bg-gold-300"
            >
              <ClipboardCheck className="size-4" aria-hidden="true" />
              {PRIMARY_CTA.label}
            </Link>

            <Link
              href="/sleep/problems"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-4.5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-white/10"
            >
              了解睡眠问题
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>

          {/*
            产品入口。需求文档要求首屏能进产品，但顺序上它排在自测与问题之后，
            且样式是低调的文字链接——不是并列的第三个按钮。
          */}
          <p className="mt-3.5 text-[12px] text-ink-300">
            想先了解产品？
            <Link
              href="/product"
              className="ml-1 text-ink-100 underline underline-offset-4 transition-colors hover:text-white"
            >
              了解和颐林睡眠大师
            </Link>
          </p>
        </div>
      </Container>
    </section>
  )
}
