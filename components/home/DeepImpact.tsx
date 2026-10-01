import { ArrowRight, Info } from 'lucide-react'
import Link from 'next/link'

import { Container } from '@/components/layout/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'

/**
 * 首页第三屏：睡眠对身体的深层次影响。
 *
 * 这一屏从「表面症状」推进到「系统性影响」，是第二屏的自然延续：
 * 第二屏说的是「今晚能感觉到什么」，本屏说的是「长期会发生什么」。
 *
 * ⚠️ 合规要点：图中的器官影响属于通用睡眠医学常识（对应证据等级 Level 1），
 *    因此页面上标注了资料来源。但必须注意两点：
 *      1. 这是「睡眠不足的影响」，不是「本产品的适应症」——不暗示产品能逆转这些；
 *      2. 不做恐吓式表述。图中信息已足够说明问题，文案不必再加码。
 */
const POINTS = [
  {
    title: '从「今晚难受」到「长期改变」',
    text: '睡眠不足引起的症状表现短期是可逆的，补一觉多半能缓过来。但如果长期睡眠不足，影响会沉淀到更深的层面。',
  },
  {
    title: '影响是系统性的',
    text: '睡眠不是某个器官的私事。它参与调节大脑、心血管、免疫与代谢等多个系统，因此睡眠不足的影响也不会局限在一处。',
  },
  {
    title: '这也是为什么值得重视',
    text: '把睡眠当作「可牺牲的时间」来用，代价往往在很久之后才显现。改善睡眠的价值不只在今晚睡得好。',
  },
]

export function DeepImpact() {
  return (
    <section className="border-t border-sand-200 py-16 sm:py-20">
      <Container size="wide">
        <SectionHeading
          title="睡眠对身体的深层次影响"
          description="睡眠参与调节身体的多个系统。长期不足时，影响会从「感觉累」延伸到更深的地方。"
        />

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          {/* 示意图。原始素材为 828×612，限制最大宽度避免放大后文字发虚 */}
          <figure className="rounded-2xl border border-sand-200 bg-white p-4 shadow-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/sleep-deprivation-impact.webp"
              alt="睡眠剥夺对人体的影响示意图，标注了大脑、心脏、免疫系统与新陈代谢等系统受到的影响"
              width={828}
              height={612}
              loading="lazy"
              className="mx-auto h-auto w-full max-w-[828px] rounded-xl"
            />
            <figcaption className="mt-3 text-center text-[12px] text-sand-500">
              睡眠剥夺对人体的影响（示意图）
            </figcaption>
          </figure>

          <div>
            <ul className="space-y-5">
              {POINTS.map((point, index) => (
                <li key={point.title} className="flex gap-3.5">
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-ink-900 text-[12px] font-bold text-white">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-[15px] font-bold text-ink-950">{point.title}</h3>
                    <p className="mt-1.5 text-[13.5px] leading-relaxed text-sand-600">
                      {point.text}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-7 rounded-xl border border-sand-200 bg-sand-100/60 p-4">
              <p className="flex gap-2 text-[12.5px] leading-relaxed text-sand-600">
                <Info className="mt-0.5 size-3.5 shrink-0 text-sand-400" aria-hidden="true" />
                <span>
                  以上内容属于通用睡眠医学常识，用于帮助理解睡眠的作用，
                  <strong className="font-medium text-sand-700">
                    不构成本产品的功效说明
                  </strong>
                  。如果您长期睡眠不足并已影响健康，建议就医评估，而不是依赖任何食品类产品。
                </span>
              </p>
            </div>

            <Link
              href="/sleep/basic"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink-900 px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-ink-950"
            >
              了解睡眠是怎么运作的
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  )
}
