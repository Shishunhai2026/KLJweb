import type { Metadata } from 'next'
import { ArrowRight, Info } from 'lucide-react'
import Link from 'next/link'

import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Container } from '@/components/layout/Container'
import { JsonLd } from '@/components/seo/JsonLd'
import { ButtonLink } from '@/components/ui/Button'
import { getPublishedProductKnowledge } from '@/lib/content'
import { PRODUCT_SECTIONS } from '@/lib/content/taxonomy'
import { HOME_CRUMB, SECTION_CRUMBS } from '@/lib/seo/breadcrumbs'
import { buildProductLd } from '@/lib/seo/jsonld'
import { buildMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = buildMetadata({
  title: '和颐林睡眠大师产品中心',
  description:
    '和颐林睡眠大师（植物复合粉特殊膳食）的完整公开资料：产品基本信息、配方成分、使用方法、检测资料、专利与研究资料，每一项均标注证据等级与核验状态。',
  path: '/product',
  keywords: [
    '和颐林睡眠大师',
    '和颐林睡眠大师是什么',
    '睡眠大师产品',
    '植物复合粉特殊膳食',
    'SOD植物复合粉',
  ],
})

/** 产品基础信息，来自产品标签。 */
const BASIC_INFO = [
  { label: '品牌名称', value: '和颐林睡眠大师' },
  { label: '产品名称', value: '植物复合粉特殊膳食' },
  { label: '规格', value: '10g × 60（10g × 20/小盒）' },
  { label: '保质期', value: '18 个月' },
  { label: '贮藏方式', value: '密闭、置阴凉干燥处' },
  { label: '不适宜人群', value: '婴幼儿' },
]

/** 配料表，来自产品标签。 */
const INGREDIENTS = [
  '绿小麦粉',
  '黑小麦粉',
  '沙棘粉',
  '刺梨粉',
  '百合粉',
  '桑椹粉',
  '针叶樱桃粉',
  'γ-氨基丁酸（GABA）',
  '茶叶茶氨酸',
]

export default function ProductOverviewPage() {
  const knowledge = getPublishedProductKnowledge()
  const sectionsWithContent = PRODUCT_SECTIONS.filter((section) =>
    knowledge.some((item) => item.section === section.slug),
  )

  return (
    <>
      <JsonLd
        data={buildProductLd({
          name: '和颐林睡眠大师',
          description:
            '和颐林睡眠大师为植物复合粉特殊膳食，不是药品，不能用于治疗疾病。产品中心公开配方、使用方法、检测与相关资料，并标注证据等级与核验状态。',
          path: '/product',
          category: '植物复合粉特殊膳食',
        })}
      />

      <div className="border-b border-sand-200 bg-white">
        <Container size="wide" className="py-8">
          <Breadcrumbs crumbs={[HOME_CRUMB, SECTION_CRUMBS.product]} />
          <h1 className="mt-5 text-[1.75rem] font-bold leading-tight tracking-tight text-ink-950 sm:text-[2rem]">
            和颐林睡眠大师
          </h1>
          <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-sand-600">
            产品中心公开完整的产品资料：配方成分、使用方法、检测项目与相关研究。
            每一项都标注了证据等级与核验状态。
          </p>
        </Container>
      </div>

      <Container size="wide" className="py-10">
        {/* 定性说明放在最前，这是本站与产品宣传页最根本的区别 */}
        <div className="rounded-2xl border border-caution-100 bg-caution-50 p-5 sm:p-6">
          <div className="flex gap-3">
            <Info className="mt-0.5 size-4 shrink-0 text-caution-600" aria-hidden="true" />
            <div>
              <h2 className="text-[14.5px] font-bold text-caution-700">
                和颐林睡眠大师是植物复合粉特殊膳食，不是药品
              </h2>
              <p className="mt-2 text-[13.5px] leading-relaxed text-caution-700">
                按照我国法规，食品类产品不得宣称具有治疗疾病的功能，本站也不会作此类表述。
                本页及产品中心展示的资料中，来自企业的部分均已标注证据等级与核验状态，
                <strong className="font-semibold">不能等同于经过独立核验的医学证据</strong>。
                如果您正在被失眠困扰，建议先由医生评估。
              </p>
            </div>
          </div>
        </div>

        {/* 产品基础信息 */}
        <section className="mt-10">
          <h2 className="text-[17px] font-bold tracking-tight text-ink-950">产品基本信息</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BASIC_INFO.map((row) => (
              <div key={row.label} className="rounded-card border border-sand-200 bg-white p-4">
                <dt className="text-[12.5px] text-sand-500">{row.label}</dt>
                <dd className="mt-1 text-[15px] font-medium text-ink-900">{row.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[12.5px] text-sand-500">
            以上信息来自产品标签。实际规格与标示请以您收到的产品包装为准。
          </p>
        </section>

        {/* 配料 */}
        <section className="mt-10">
          <h2 className="text-[17px] font-bold tracking-tight text-ink-950">配料组成</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-sand-600">
            产品由九种植物与营养成分配伍而成。配方以谷物为基底，搭配药食同源食材与两种神经调节因子。
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {INGREDIENTS.map((name) => (
              <li
                key={name}
                className="rounded-full border border-sand-200 bg-white px-3.5 py-1.5 text-[13.5px] text-sand-700"
              >
                {name}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[12.5px] text-sand-500">
            配料表以产品标签标示为准。原料的产地、等级与检测资料可在相应栏目中查看。
          </p>
        </section>

        {/* 资料栏目 */}
        <section className="mt-12">
          <h2 className="text-[17px] font-bold tracking-tight text-ink-950">产品资料</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-sand-600">
            以下是目前公开的产品资料栏目。每一页都标明了资料的来源与核验状态。
          </p>

          {sectionsWithContent.length > 0 ? (
            <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sectionsWithContent.map((section) => (
                <li key={section.slug}>
                  <Link
                    href={section.path}
                    className="group flex h-full flex-col rounded-card border border-sand-200 bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-ink-200 hover:shadow-card-hover"
                  >
                    <h3 className="text-[15.5px] font-bold text-ink-950">{section.label}</h3>
                    <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-sand-600">
                      {knowledge.find((k) => k.section === section.slug)?.summary}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-600">
                      查看资料
                      <ArrowRight
                        className="size-3.5 transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-[14px] text-sand-600">产品资料正在整理中。</p>
          )}
        </section>

        {/* 咨询入口 */}
        <section className="mt-12 rounded-2xl bg-night-gradient p-8 sm:p-10">
          <div className="max-w-2xl">
            <h2 className="text-lg font-bold tracking-tight text-white sm:text-xl">
              想进一步了解产品？
            </h2>
            <p className="mt-3 text-[14.5px] leading-relaxed text-ink-200">
              您可以先查看产品常见问题，或通过联系方式咨询。
              如果您正在服用处方药或有慢性疾病，请先咨询您的主治医生。
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href="/product/faq" variant="gold">
                查看产品常见问题
                <ArrowRight className="size-4" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="/contact" variant="onDark">
                联系我们
              </ButtonLink>
            </div>
          </div>
        </section>
      </Container>
    </>
  )
}
