import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Container } from '@/components/layout/Container'
import { HOME_CRUMB, SECTION_CRUMBS } from '@/lib/seo/breadcrumbs'
import { buildMetadata } from '@/lib/seo/metadata'
import { SITE } from '@/lib/seo/site'

export const metadata: Metadata = buildMetadata({
  title: '关于我们',
  description:
    '和颐林睡眠大师官方网站的定位与内容原则：这是一个睡眠健康知识平台，而不只是产品展示页。说明我们的内容分级与审核方式。',
  path: '/about',
  keywords: ['关于我们', '和颐林睡眠大师', '北京和颐林生物科技'],
})

const PRINCIPLES = [
  {
    title: '先讲知识，再谈产品',
    text: '睡眠问题、睡眠知识、睡眠自测这三件事负责帮助用户，产品资料只占其中一个部分，并且排在内容的后面。',
  },
  {
    title: '每条资料标明来源',
    text: '研究、检测与产品数据都标注证据等级。来自企业的资料会明确写出核验状态，不会被包装成医学结论。',
  },
  {
    title: '不用体验替代证据',
    text: '用户反馈存在个体差异，只代表个人感受，不构成产品功效保证。我们不会把它当作有效性的证明。',
  },
  {
    title: '不越界',
    text: '不做疾病诊断，不声称产品能治病，不建议停用处方药。涉及用药的问题一律引导回医生。',
  },
]

export default function AboutPage() {
  return (
    <>
      <div className="border-b border-sand-200 bg-white">
        <Container size="narrow" className="py-8">
          <Breadcrumbs crumbs={[HOME_CRUMB, SECTION_CRUMBS.about]} />
          <h1 className="mt-5 text-[1.75rem] font-bold leading-tight tracking-tight text-ink-950 sm:text-[2rem]">
            关于我们
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-sand-600">
            这是一个睡眠健康知识平台，而不只是一个产品展示页。
          </p>
        </Container>
      </div>

      <Container size="narrow" className="py-10">
        <div className="prose-cn">
          <h2>这个网站想解决什么问题</h2>
          <p>
            绝大多数睡不好的人，第一反应是在搜索引擎里输入「半夜总是醒怎么办」，
            而不是「买什么产品」。他们需要的是先弄明白自己发生了什么，
            再决定下一步做什么。
          </p>
          <p>
            所以我们把网站的重点放在三个地方：把睡眠知识讲清楚、
            提供一个能把情况整理成记录的睡眠自测工具、
            以及一个能陪着梳理情况的知识助手。
            产品资料放在这些之后，并且尽量把来源交代清楚。
          </p>

          <h2>我们的内容原则</h2>
        </div>

        <ul className="mt-5 grid gap-4 sm:grid-cols-2">
          {PRINCIPLES.map((item) => (
            <li key={item.title} className="rounded-card border border-sand-200 bg-white p-5">
              <h3 className="text-[15px] font-bold text-ink-950">{item.title}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-sand-600">{item.text}</p>
            </li>
          ))}
        </ul>

        <div className="prose-cn mt-8">
          <h2>关于证据分级</h2>
          <p>
            健康信息最有价值的部分，往往不是结论本身，而是结论的来源有多可靠。
            我们把站内所有资料分为六个等级，从公开的医学资料到个人使用体验，
            并在页面上直接标出[每一级的含义](/medical-disclaimer)。
          </p>
          <p>
            这样做会让一些内容看起来「没那么有说服力」——因为企业提供的研究确实
            不等同于经过独立核验的医学证据。但这正是我们想要的：
            与其把所有内容混在一起显得很有分量，不如让您能自己判断。
          </p>

          <h2>关于产品与运营</h2>
          <p>
            {SITE.name} 由 <strong>{SITE.brandOwner.legalName}</strong> 研发与出品，
            商标与产品资料归其所有。本站由 <strong>{SITE.operator.legalName}</strong> 运营与销售，
            负责网站内容维护、用户咨询与售后服务。
          </p>
          <p>
            产品为植物复合粉特殊膳食，<strong>不是药品，不能用于治疗疾病</strong>。
            完整的产品资料——配方、使用方法、检测项目、专利与研究资料——
            都可以在[产品中心](/product)查看，每一项都标注了证据等级与核验状态。
          </p>

          <h2>内容审核</h2>
          <p>
            涉及症状判断与产品表述的内容会经过专业审核。
            每篇文章底部都标注了作者、审核情况与最后更新日期。
            如果您发现内容存在事实性错误，欢迎通过[联系我们](/contact)指出。
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/product"
            className="inline-flex items-center gap-2 rounded-full bg-ink-900 px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-ink-950"
          >
            查看产品资料
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Link
            href="/medical-disclaimer"
            className="inline-flex items-center gap-2 rounded-full border border-sand-300 bg-white px-5 py-2.5 text-[14px] font-medium text-ink-900 transition-colors hover:bg-sand-50"
          >
            健康免责声明
          </Link>
        </div>
      </Container>
    </>
  )
}
