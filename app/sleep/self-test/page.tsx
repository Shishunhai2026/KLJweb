import type { Metadata } from 'next'

import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Container } from '@/components/layout/Container'
import { IsiTest } from '@/components/isi/IsiTest'
import { SELF_TEST_DISCLAIMER } from '@/lib/content/evidence'
import { HOME_CRUMB, SECTION_CRUMBS } from '@/lib/seo/breadcrumbs'
import { buildMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = buildMetadata({
  title: '免费睡眠自测（ISI 失眠严重程度指数）',
  description:
    '使用 ISI 失眠严重程度指数量表在线自测睡眠情况，7 个问题约 2 分钟。测完立即得到当前睡眠情况、可能比较突出的方面与改善建议。无需注册，作答不上传。',
  path: '/sleep/self-test',
  keywords: ['睡眠自测', '失眠自测', 'ISI 量表', '失眠严重程度指数', '免费睡眠测试'],
})

export default function SelfTestPage() {
  return (
    <>
      <div className="border-b border-sand-200 bg-white">
        <Container size="narrow" className="py-8">
          <Breadcrumbs
            crumbs={[HOME_CRUMB, SECTION_CRUMBS.sleep, SECTION_CRUMBS.selfTest]}
          />
          <h1 className="mt-5 text-[1.75rem] font-bold leading-tight tracking-tight text-ink-950 sm:text-[2rem]">
            免费睡眠自测
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-sand-600">
            用 ISI 失眠严重程度指数量表，把您的睡眠情况整理成一份可参考的记录。
          </p>
        </Container>
      </div>

      <Container size="narrow" className="py-10">
        <IsiTest />

        <section className="mt-10 rounded-xl border border-sand-200 bg-sand-100/60 p-5">
          <h2 className="text-[14px] font-bold text-ink-950">关于 ISI 量表</h2>
          <p className="mt-2 text-[13.5px] leading-relaxed text-sand-600">
            ISI（Insomnia Severity Index，失眠严重程度指数）是一个公开的睡眠筛查工具，
            由 7 个条目组成，每条 0–4 分，总分 0–28 分，用于评估睡眠问题的严重程度。
            它被广泛用于临床筛查与研究中。
          </p>
          <p className="mt-3 text-[13.5px] leading-relaxed text-sand-600">
            {SELF_TEST_DISCLAIMER}
            如果自测结果提示问题较为明显，建议到睡眠门诊、神经内科或精神心理科做进一步评估。
          </p>
        </section>
      </Container>
    </>
  )
}
