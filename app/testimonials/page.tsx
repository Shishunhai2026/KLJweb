import type { Metadata } from 'next'
import { AlertTriangle } from 'lucide-react'

import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Container } from '@/components/layout/Container'
import { EvidenceBadge } from '@/components/geo'
import { TESTIMONIAL_DISCLAIMER } from '@/lib/content/evidence'
import { HOME_CRUMB, SECTION_CRUMBS } from '@/lib/seo/breadcrumbs'
import { buildMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = buildMetadata({
  title: '用户反馈',
  description:
    '和颐林睡眠大师的用户体验分享。所有内容均为个人使用感受，存在个体差异，不构成产品功效保证，也不能作为有效性的医学证据。',
  path: '/testimonials',
  keywords: ['和颐林睡眠大师用户反馈', '用户体验', '睡眠大师反馈'],
})

/**
 * 用户反馈。
 *
 * ⚠️ 合规要点（已核实的 F5）：
 *  · 企业提供的一条反馈「长期坚持喝的老伙伴，已经不服用安眠药了」
 *    —— 等同于鼓励停药，**V1 不采用**。
 *  · 企业资料中混入的房产项目数据（37 城市 / 30586 户业主）属于误粘贴，已删除。
 *
 * 当前页面不放置任何具体反馈内容，因为客户尚未提供**可公开发布且经过核实**的
 * 用户授权素材。编造用户反馈比留空更糟——这会直接违反本站的内容原则。
 */
export default function TestimonialsPage() {
  return (
    <>
      <div className="border-b border-sand-200 bg-white">
        <Container size="narrow" className="py-8">
          <Breadcrumbs crumbs={[HOME_CRUMB, SECTION_CRUMBS.testimonials]} />
          <h1 className="mt-5 text-[1.75rem] font-bold leading-tight tracking-tight text-ink-950 sm:text-[2rem]">
            用户反馈
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-sand-600">
            个人使用感受的分享。请先阅读下方的说明，再决定如何理解这些内容。
          </p>
        </Container>
      </div>

      <Container size="narrow" className="py-10">
        {/* 免责声明放在最前，且不可折叠 */}
        <div className="rounded-2xl border border-caution-100 bg-caution-50 p-5">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-caution-600" aria-hidden="true" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-[14.5px] font-bold text-caution-700">请这样理解用户反馈</h2>
                <EvidenceBadge level={6} />
              </div>
              <ul className="mt-2.5 space-y-2 text-[13.5px] leading-relaxed text-caution-700">
                <li>
                  · 用户反馈属于<strong className="font-semibold">个人体验</strong>，
                  存在个体差异，<strong className="font-semibold">不构成产品功效保证</strong>。
                </li>
                <li>
                  · 不同人的睡眠情况、作息与身体状态各不相同，个别人的感受无法推广到其他人。
                </li>
                <li>
                  · 用户反馈<strong className="font-semibold">不能作为产品效果的医学证据</strong>，
                  也不能用来判断产品是否对您有效。
                </li>
                <li>
                  · 任何关于您自身睡眠问题的判断，都应咨询医生或其他专业医疗人员。
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-dashed border-sand-300 bg-white p-8 text-center">
          <h2 className="text-[16px] font-bold text-ink-950">内容待补充</h2>
          <p className="mx-auto mt-3 max-w-xl text-[14px] leading-relaxed text-sand-600">
            本页尚未展示具体反馈内容。原因是我们需要客户提供
            <strong className="font-medium text-sand-700">取得用户授权、可公开发布</strong>
            的素材，并且逐条经过合规复核。
          </p>
          <p className="mx-auto mt-3 max-w-xl text-[13.5px] leading-relaxed text-sand-500">
            我们不会编造用户反馈。企业提供的原始素材中有两处需要处理：
            其一为「长期坚持喝的老伙伴，已经不服用安眠药了」——这条等同于鼓励停药，
            不予采用；另一处混入了与产品无关的其他项目数据，已剔除。
          </p>
        </div>

        <div className="prose-cn mt-8">
          <h2>如果您希望分享您的体验</h2>
          <p>
            欢迎通过<a href="/contact">联系我们</a>与我们沟通。
            发布前我们需要确认：您授权我们公开这段内容，
            并且内容中不包含涉及用药调整的表述。
          </p>
          <p className="text-[13px] text-sand-500">{TESTIMONIAL_DISCLAIMER}</p>
        </div>
      </Container>
    </>
  )
}
