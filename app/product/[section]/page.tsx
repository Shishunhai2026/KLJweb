import type { Metadata } from 'next'
import { AlertTriangle } from 'lucide-react'
import { notFound } from 'next/navigation'

import { MdxContent } from '@/components/article/MdxContent'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Container } from '@/components/layout/Container'
import { EvidenceBadge, SourceList } from '@/components/geo'
import { JsonLd } from '@/components/seo/JsonLd'
import { getProductKnowledgeBySection, getPublishedProductKnowledge } from '@/lib/content'
import { PRODUCT_SECTIONS, type ProductSection } from '@/lib/content/taxonomy'
import { HOME_CRUMB, SECTION_CRUMBS } from '@/lib/seo/breadcrumbs'
import { buildProductLd } from '@/lib/seo/jsonld'
import { buildMetadata } from '@/lib/seo/metadata'

export function generateStaticParams() {
  return PRODUCT_SECTIONS.filter(
    (section) => getProductKnowledgeBySection(section.slug).length > 0,
  ).map((section) => ({ section: section.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>
}): Promise<Metadata> {
  const { section } = await params
  const meta = PRODUCT_SECTIONS.find((s) => s.slug === section)
  if (!meta) {
    return buildMetadata({
      title: '产品资料',
      description: '未找到该产品资料栏目。',
      path: `/product/${section}`,
      robots: 'noindex,nofollow',
    })
  }

  const items = getProductKnowledgeBySection(meta.slug)
  return buildMetadata({
    title: `和颐林睡眠大师${meta.label}`,
    description:
      items[0]?.summary ??
      `和颐林睡眠大师的${meta.label}说明。产品为植物复合粉特殊膳食，不是药品，不能用于治疗疾病。`,
    path: meta.path,
    keywords: [`和颐林睡眠大师${meta.label}`, '和颐林睡眠大师', '睡眠大师', meta.label],
  })
}

export default async function ProductSectionPage({
  params,
}: {
  params: Promise<{ section: string }>
}) {
  const { section } = await params
  const meta = PRODUCT_SECTIONS.find((s) => s.slug === section)
  if (!meta) notFound()

  const items = getProductKnowledgeBySection(meta.slug as ProductSection)
  if (items.length === 0) notFound()

  return (
    <>
      <JsonLd
        data={buildProductLd({
          name: `和颐林睡眠大师${meta.label}`,
          description: items[0]?.summary ?? `和颐林睡眠大师的${meta.label}说明。`,
          path: meta.path,
          category: '植物复合粉特殊膳食',
        })}
      />

      <div className="border-b border-sand-200 bg-white">
        <Container size="narrow" className="py-8">
          <Breadcrumbs crumbs={[HOME_CRUMB, SECTION_CRUMBS.product, { name: meta.label, path: meta.path }]} />
          <h1 className="mt-5 text-[1.75rem] font-bold leading-tight tracking-tight text-ink-950 sm:text-[2rem]">
            {items[0]?.title ?? meta.label}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-sand-600">
            {items[0]?.summary}
          </p>
        </Container>
      </div>

      <Container size="narrow" className="py-10">
        {/*
          产品页顶部固定提示。
          本品为特殊膳食，页面上的任何内容都不构成功效宣称——
          这句话放在最前面，而不是折叠在页脚。
        */}
        <div className="rounded-xl border border-caution-100 bg-caution-50 p-4">
          <p className="text-[13px] leading-relaxed text-caution-700">
            <strong className="font-semibold">和颐林睡眠大师为植物复合粉特殊膳食，不是药品，不能用于治疗疾病。</strong>
            本页内容整理自企业提供的产品资料，其中来自企业的资料均标注了证据等级，未经过独立第三方核验。
          </p>
        </div>

        <div className="mt-8 space-y-10">
          {items.map((item) => (
            <article key={item.slug} id={item.slug}>
              {items.length > 1 ? (
                <h2 className="text-[17px] font-bold tracking-tight text-ink-950">{item.title}</h2>
              ) : null}

              {item.claims.length > 0 ? (
                <div className="mt-4 space-y-2.5">
                  {item.claims.map((claim) => (
                    <ClaimCard key={claim.claim} claim={claim} />
                  ))}
                </div>
              ) : null}

              <div className="mt-5">
                <MdxContent source={item.body} />
              </div>

              {item.sources.length > 0 ? (
                <div className="mt-6">
                  <SourceList sources={item.sources} title="本条资料来源" id={`sources-${item.slug}`} />
                </div>
              ) : null}
            </article>
          ))}
        </div>

        <OtherSections current={meta.slug} />
      </Container>
    </>
  )
}

/** 产品表述卡片。有争议或待核验的表述会显著标出。 */
function ClaimCard({
  claim,
}: {
  claim: {
    claim: string
    value?: string
    evidenceLevel: 1 | 2 | 3 | 4 | 5 | 6
    verificationStatus: 'verified-company' | 'pending-independent' | 'disputed'
    disclaimer?: string
    disputedReason?: string
  }
}) {
  const disputed = claim.verificationStatus === 'disputed'

  return (
    <div
      className={
        disputed
          ? 'rounded-xl border border-alert-100 bg-alert-50 p-4'
          : 'rounded-xl border border-sand-200 bg-white p-4'
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="flex-1 text-[14.5px] leading-relaxed text-sand-700">{claim.claim}</p>
        {claim.value ? (
          <span className="shrink-0 text-[15px] font-bold tabular-nums text-ink-800">
            {claim.value}
          </span>
        ) : null}
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <EvidenceBadge level={claim.evidenceLevel} showLabel />
        {disputed ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-alert-100 px-2 py-0.5 text-[11px] font-semibold text-alert-700">
            <AlertTriangle className="size-3" aria-hidden="true" />
            资料记载不一致，待确认
          </span>
        ) : claim.verificationStatus === 'pending-independent' ? (
          <span className="text-[11.5px] text-caution-700">企业提供，待独立核验</span>
        ) : null}
      </div>

      {disputed && claim.disputedReason ? (
        <p className="mt-2.5 rounded-md bg-white/70 px-3 py-2 text-[12.5px] leading-relaxed text-alert-700">
          {claim.disputedReason}
        </p>
      ) : null}

      {claim.disclaimer ? (
        <p className="mt-2 text-[12px] text-sand-500">{claim.disclaimer}</p>
      ) : null}
    </div>
  )
}

/** 其他产品栏目入口。 */
function OtherSections({ current }: { current: string }) {
  const populated = new Set(getPublishedProductKnowledge().map((p) => p.section))
  const others = PRODUCT_SECTIONS.filter((s) => s.slug !== current && populated.has(s.slug))
  if (others.length === 0) return null

  return (
    <nav aria-label="其他产品资料" className="mt-12 border-t border-sand-200 pt-8">
      <h2 className="text-[15px] font-bold tracking-tight text-ink-950">其他产品资料</h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {others.map((section) => (
          <li key={section.slug}>
            <a
              href={section.path}
              className="inline-flex rounded-full border border-sand-300 bg-white px-3.5 py-1.5 text-[13px] text-sand-700 transition-colors hover:border-ink-300 hover:text-ink-800"
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

