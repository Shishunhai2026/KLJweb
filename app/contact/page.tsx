import type { Metadata } from 'next'

import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Container } from '@/components/layout/Container'
import { LeadForm } from '@/components/lead/LeadForm'
import { HOME_CRUMB, SECTION_CRUMBS } from '@/lib/seo/breadcrumbs'
import { buildMetadata } from '@/lib/seo/metadata'
import { SITE } from '@/lib/seo/site'

export const metadata: Metadata = buildMetadata({
  title: '联系我们',
  description:
    '通过手机号或微信与和颐林睡眠大师团队联系。也可以留下联系方式，我们会尽快回复。',
  path: '/contact',
  keywords: ['联系我们', '和颐林睡眠大师联系方式', '睡眠咨询'],
})

const CONTACT_CHANNELS = [
  {
    label: '客服微信',
    value: SITE.operator.wechat,
    hint: '添加时请备注「睡眠咨询」，方便我们更快为您服务。',
    copyable: true,
  },
  {
    label: '咨询电话',
    value: SITE.operator.telephone,
    hint: '如未接通，可能是客服正在服务其他用户，可稍后再拨或添加微信。',
    tel: true,
  },
]

export default function ContactPage() {
  return (
    <>
      <div className="border-b border-sand-200 bg-white">
        <Container size="narrow" className="py-8">
          <Breadcrumbs crumbs={[HOME_CRUMB, SECTION_CRUMBS.contact]} />
          <h1 className="mt-5 text-[1.75rem] font-bold leading-tight tracking-tight text-ink-950 sm:text-[2rem]">
            联系我们
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-sand-600">
            如果您想进一步了解产品资料，或者希望有人帮您梳理睡眠情况，可以通过下面的方式联系。
          </p>
        </Container>
      </div>

      <Container size="narrow" className="py-10">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-[16px] font-bold text-ink-950">联系方式</h2>
            <dl className="mt-4 space-y-4">
              {CONTACT_CHANNELS.map((channel) => (
                <div key={channel.label} className="rounded-xl border border-sand-200 bg-white p-4">
                  <dt className="text-[12.5px] text-sand-500">{channel.label}</dt>
                  <dd className="mt-1">
                    {channel.tel ? (
                      <a
                        href={`tel:${channel.value}`}
                        className="text-[17px] font-bold tabular-nums text-ink-900 underline underline-offset-4 hover:text-ink-700"
                      >
                        {channel.value}
                      </a>
                    ) : (
                      /* 微信号用可选中字体展示，方便用户直接复制 */
                      <span className="select-all text-[17px] font-bold tabular-nums text-ink-900">
                        {channel.value}
                      </span>
                    )}
                  </dd>
                  <p className="mt-2 rounded-md bg-sand-100 px-2.5 py-1.5 text-[11.5px] leading-relaxed text-sand-600">
                    {channel.hint}
                  </p>
                </div>
              ))}
            </dl>

            <div className="mt-6 rounded-xl border border-sand-200 bg-sand-100/60 p-5">
              <h2 className="text-[14px] font-bold text-ink-950">品牌与运营主体</h2>
              <dl className="mt-3 space-y-3 text-[13.5px] leading-relaxed">
                <div>
                  <dt className="text-[12.5px] text-sand-500">品牌所有方</dt>
                  <dd className="mt-0.5 font-medium text-sand-700">
                    {SITE.brandOwner.legalName}
                  </dd>
                  <dd className="mt-0.5 text-[12.5px] text-sand-500">
                    成立于 {SITE.brandOwner.foundingYear} 年，负责产品研发与生产
                  </dd>
                </div>
                <div>
                  <dt className="text-[12.5px] text-sand-500">运营与销售</dt>
                  <dd className="mt-0.5 font-medium text-sand-700">
                    {SITE.operator.legalName}
                  </dd>
                  <dd className="mt-0.5 text-[12.5px] text-sand-500">
                    负责本站运营、用户咨询与售后服务，也是本网站的备案主体
                  </dd>
                </div>
              </dl>
            </div>

            <div className="mt-6 rounded-xl border border-caution-100 bg-caution-50 p-5">
              <h2 className="text-[14px] font-bold text-caution-700">如果您正在接受治疗</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-caution-700">
                请先咨询您的主治医生。我们不提供诊断，也不建议您停用或调整处方药。
                如果出现胸痛、呼吸困难，或您有伤害自己的想法，请立即拨打 120，
                或拨打全国统一心理援助热线 12356。
              </p>
            </div>
          </div>

          <LeadForm source="direct" />
        </div>
      </Container>
    </>
  )
}
