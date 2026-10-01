import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ArticleCard } from '@/components/article/ArticleCard'
import { MdxContent } from '@/components/article/MdxContent'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Container } from '@/components/layout/Container'
import { CoreConclusions, FaqSection, KeyFacts, QuickAnswer, ReviewMeta, SourceList } from '@/components/geo'
import { JsonLd } from '@/components/seo/JsonLd'
import { ButtonLink } from '@/components/ui/Button'
import {
  getArticleBySlug,
  getArticlesBySlugs,
  getProblemBySlug,
  getPublishedArticles,
  getPublishedProductKnowledge,
} from '@/lib/content'
import { SELF_TEST_DISCLAIMER } from '@/lib/content/evidence'
import { getArticleCategory } from '@/lib/content/taxonomy'
import { HOME_CRUMB, SECTION_CRUMBS } from '@/lib/seo/breadcrumbs'
import { buildArticleLd, buildFaqPageLd } from '@/lib/seo/jsonld'
import { buildMetadata } from '@/lib/seo/metadata'
import { articlePath, problemPath } from '@/lib/seo/routes'
import {
  getAuthorDisplayName,
  getAuthorSchemaName,
  getReviewerDisplayName,
  getReviewerSchemaName,
} from '@/lib/seo/site'
import { PRIMARY_CTA } from '@/lib/nav'

export function generateStaticParams() {
  return getPublishedArticles().map((article) => ({ slug: article.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) {
    return buildMetadata({
      title: '文章不存在',
      description: '未找到该文章。',
      path: articlePath(slug),
      robots: 'noindex,nofollow',
    })
  }

  return buildMetadata({
    title: article.seo.title ?? article.title,
    description: article.seo.description,
    path: articlePath(article.slug),
    keywords: article.seo.keywords,
    robots: article.seo.robots,
    type: 'article',
    publishedTime: article.publishedAt,
    modifiedTime: article.updatedAt,
    image: article.ogImage,
  })
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) notFound()

  const category = getArticleCategory(article.category)
  const related = getArticlesBySlugs(article.relatedArticleSlugs)
  // article.problemSlug 指向的是**睡眠问题专题的 slug**，不是 taxonomy 分类。
  // 两者命名相近（如 night-awakening）但语义不同，必须用 getProblemBySlug。
  const problem = getProblemBySlug(article.problemSlug)
  const productMaterials = getPublishedProductKnowledge().filter((p) =>
    (article.productKnowledgeSlugs ?? []).includes(p.slug),
  )

  // 署名：frontmatter 里存的是 id（如 tian-zonggao），署名从站点登记表解析。
  // 展示名（可含敬称）给页面，姓名（纯姓名）给 JSON-LD——两者不能互换。
  const authorName = getAuthorDisplayName(article.authorId)
  const authorSchemaName = getAuthorSchemaName(article.authorId)
  // 审核人只在这篇文章真的登记了 reviewerId 时才有值。
  // 从前这里回退到全站默认审核人，于是纯睡眠结构科普也被署名「资料审核：田宗高老师」——
  // 一次没发生过的医学审核。宁可这一行不出现，也不要出现一个不成立的名字。
  const reviewerName = article.reviewerId ? getReviewerDisplayName(article.reviewerId) : undefined
  const reviewerSchemaName = article.reviewerId
    ? getReviewerSchemaName(article.reviewerId)
    : undefined

  const crumbs = [
    HOME_CRUMB,
    SECTION_CRUMBS.knowledge,
    { name: article.title, path: articlePath(article.slug) },
  ]

  return (
    <>
      <JsonLd
        data={buildArticleLd({
          headline: article.title,
          description: article.seo.description,
          path: articlePath(article.slug),
          publishedTime: article.publishedAt,
          modifiedTime: article.updatedAt,
          reviewedTime: article.lastReviewedAt,
          authorName: authorSchemaName,
          reviewerName: reviewerSchemaName,
          image: article.ogImage,
          keywords: article.seo.keywords,
          articleSection: category.label,
          sources: article.sources,
        })}
      />
      <JsonLd data={buildFaqPageLd(article.faq)} />

      <div className="border-b border-sand-200 bg-white">
        <Container size="narrow" className="py-8">
          <Breadcrumbs crumbs={crumbs} />
          <p className="mt-5 text-[12.5px] font-medium text-ink-600">{category.label}</p>
          <h1 className="mt-2 text-[1.75rem] font-bold leading-tight tracking-tight text-ink-950 sm:text-[2rem]">
            {article.title}
          </h1>
        </Container>
      </div>

      <Container size="narrow" className="py-10">
        <div className="space-y-9">
          {/* GEO 区块：直接回答 → 核心结论 → 关键事实 */}
          <QuickAnswer>{article.quickAnswer}</QuickAnswer>

          <CoreConclusions conclusions={article.coreConclusions} />

          <KeyFacts
            facts={article.keyFacts.map((fact) => ({
              statement: fact.statement,
              value: fact.value,
              evidenceLevel: fact.evidenceLevel,
              sourceTitle: article.sources.find((s) => s.id === fact.sourceId)?.title,
            }))}
          />

          {/* 正文 */}
          <MdxContent source={article.body} />

          <FaqSection faq={article.faq} />

          {/* 相关文章 —— 站内链接网络 */}
          {related.length > 0 ? (
            <section className="border-t border-sand-200 pt-8">
              <h2 className="text-[15px] font-bold tracking-tight text-ink-950">相关阅读</h2>
              <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                {related.slice(0, 4).map((item) => (
                  <li key={item.slug}>
                    <ArticleCard article={item} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {/* 睡眠问题专题入口 */}
          {problem ? <ProblemLink slug={problem.slug} title={problem.title} /> : null}

          {/* 自测引导 */}
          <div className="rounded-xl border border-ink-100 bg-ink-50/60 p-5">
            <h2 className="text-[15px] font-bold text-ink-950">想结合自己的情况看看？</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-sand-600">
              用 ISI 量表做一次睡眠自测，约 2 分钟，
              会得到一份包含当前睡眠情况、可能存在的问题与改善建议的结果。
            </p>
            <ButtonLink href={PRIMARY_CTA.href} className="mt-4">
              {PRIMARY_CTA.label}
              <ArrowRight className="size-4" aria-hidden="true" />
            </ButtonLink>
            <p className="mt-3 text-[12.5px] text-sand-500">{SELF_TEST_DISCLAIMER}</p>
          </div>

          <SourceList sources={article.sources} />

          <ReviewMeta
            authorName={authorName}
            reviewerName={reviewerName}
            updatedAt={article.updatedAt}
            lastReviewedAt={article.lastReviewedAt}
          />

          {/* 产品资料入口 —— 按漏斗顺序放在最后 */}
          {productMaterials.length > 0 ? (
            <section className="border-t border-sand-200 pt-8">
              <h2 className="text-[15px] font-bold tracking-tight text-ink-950">相关产品资料</h2>
              <p className="mt-1.5 text-[13px] text-sand-500">
                以下为企业提供的产品资料，均标注了证据等级与核验状态。
              </p>
              <ul className="mt-3 space-y-2">
                {productMaterials.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/product/${item.section}`}
                      className="text-[14px] text-ink-600 underline underline-offset-4 hover:text-ink-800"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </Container>
    </>
  )
}

function ProblemLink({ slug, title }: { slug: string; title: string }) {
  return (
    <section className="rounded-xl border border-sand-200 bg-white p-5">
      <h2 className="text-[13px] font-medium text-sand-500">相关睡眠问题专题</h2>
      <Link
        href={problemPath(slug)}
        className="mt-2 inline-flex items-center gap-2 text-[15.5px] font-bold text-ink-900 hover:text-ink-700"
      >
        {title}
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </section>
  )
}
