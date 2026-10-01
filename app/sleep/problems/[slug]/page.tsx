import type { Metadata } from 'next'
import { ArrowRight, Info } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ArticleCard } from '@/components/article/ArticleCard'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Container } from '@/components/layout/Container'
import { FaqSection, ReviewMeta, SourceList } from '@/components/geo'
import { ButtonLink } from '@/components/ui/Button'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { getArticlesByProblem, getProblemBySlug, getPublishedProblems } from '@/lib/content'
import { SELF_TEST_DISCLAIMER } from '@/lib/content/evidence'
import { HOME_CRUMB, SECTION_CRUMBS } from '@/lib/seo/breadcrumbs'
import { buildFaqPageLd, buildMedicalWebPageLd } from '@/lib/seo/jsonld'
import { buildMetadata } from '@/lib/seo/metadata'
import { JsonLd } from '@/components/seo/JsonLd'
import { PRIMARY_CTA } from '@/lib/nav'
import { problemPath } from '@/lib/seo/routes'
import {
  getAuthorDisplayName,
  getReviewerDisplayName,
  getReviewerSchemaName,
} from '@/lib/seo/site'

/** 预生成全部睡眠问题专题页。 */
export function generateStaticParams() {
  return getPublishedProblems().map((problem) => ({ slug: problem.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const problem = getProblemBySlug(slug)
  if (!problem) {
    return buildMetadata({
      title: '睡眠问题',
      description: '未找到该睡眠问题专题。',
      path: problemPath(slug),
      robots: 'noindex,nofollow',
    })
  }

  return buildMetadata({
    title: problem.seo.title ?? problem.title,
    description: problem.seo.description,
    path: problemPath(problem.slug),
    keywords: problem.seo.keywords,
  })
}

export default async function ProblemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const problem = getProblemBySlug(slug)
  if (!problem) notFound()

  const relatedArticles = getArticlesByProblem(problem.slug)
  const crumbs = [
    HOME_CRUMB,
    SECTION_CRUMBS.sleep,
    SECTION_CRUMBS.sleepProblems,
    { name: problem.title, path: problemPath(problem.slug) },
  ]

  return (
    <>
      <JsonLd
        data={buildMedicalWebPageLd({
          name: problem.title,
          description: problem.seo.description,
          path: problemPath(problem.slug),
          modifiedTime: problem.updatedAt,
          reviewerName: getReviewerSchemaName(),
          keywords: problem.seo.keywords,
        })}
      />
      <JsonLd data={buildFaqPageLd(problem.faq)} />

      <div className="border-b border-sand-200 bg-white">
        <Container size="narrow" className="py-8">
          <Breadcrumbs crumbs={crumbs} />
          <h1 className="mt-5 text-[1.75rem] font-bold leading-tight tracking-tight text-ink-950 sm:text-[2rem]">
            {problem.title}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-sand-600">
            {problem.seo.description}
          </p>
        </Container>
      </div>

      <Container size="narrow" className="py-10">
        <div className="space-y-10">
          <Section title="常见表现">
            <ul className="space-y-2.5">
              {problem.symptoms.map((item) => (
                <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-sand-700">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-ink-400" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section
            title="可能相关因素"
            note="这里列出的不是「病因」，而是值得逐一排查的相关因素。睡眠问题通常是多种因素共同作用的结果。"
          >
            <ul className="space-y-2.5">
              {problem.possibleFactors.map((item) => (
                <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-sand-700">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-gold-400" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="相关的睡眠知识">
            <div className="prose-cn">
              {problem.sleepKnowledge
                .trim()
                .split(/\n\s*\n/)
                .map((para) => (
                  <p key={para.slice(0, 24)}>{para.trim()}</p>
                ))}
            </div>
          </Section>

          <Section title="可以尝试的改善方法">
            <ol className="space-y-3">
              {problem.improvementMethods.map((item, index) => (
                <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-sand-700">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-ink-50 text-[11px] font-semibold text-ink-700">
                    {index + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </Section>

          {/* 自测引导——漏斗中的关键一步 */}
          <div className="rounded-xl border border-ink-100 bg-ink-50/60 p-5">
            <h2 className="text-[15px] font-bold text-ink-950">想更具体地了解自己的情况？</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-sand-600">
              用 ISI 失眠严重程度指数量表做一次自测，约 2 分钟，
              会得到一份包含当前睡眠情况与改善建议的结果。
            </p>
            <ButtonLink href={PRIMARY_CTA.href} className="mt-4">
              {PRIMARY_CTA.label}
              <ArrowRight className="size-4" aria-hidden="true" />
            </ButtonLink>
            <p className="mt-3 text-[12.5px] text-sand-500">{SELF_TEST_DISCLAIMER}</p>
          </div>

          <FaqSection faq={problem.faq} />

          {relatedArticles.length > 0 ? (
            <section>
              <SectionHeading title="相关阅读" level={2} />
              <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                {relatedArticles.slice(0, 4).map((article) => (
                  <li key={article.slug}>
                    <ArticleCard article={article} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {problem.sources.length > 0 ? <SourceList sources={problem.sources} /> : null}

          {/* 睡眠问题专题涉及症状判断，一律走全站登记审核人，显式传入 */}
          <ReviewMeta
            authorName={getAuthorDisplayName()}
            reviewerName={getReviewerDisplayName()}
            updatedAt={problem.updatedAt}
            contentType="睡眠健康科普"
          />

          <OtherProblems currentSlug={problem.slug} />
        </div>
      </Container>
    </>
  )
}

function Section({
  title,
  note,
  children,
}: {
  title: string
  note?: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h2 className="text-[17px] font-bold tracking-tight text-ink-950">{title}</h2>
      {note ? (
        <p className="mt-2 flex gap-2 rounded-lg bg-sand-100 px-3 py-2.5 text-[13px] leading-relaxed text-sand-600">
          <Info className="mt-0.5 size-3.5 shrink-0 text-sand-400" aria-hidden="true" />
          <span>{note}</span>
        </p>
      ) : null}
      <div className="mt-4">{children}</div>
    </section>
  )
}

/** 其他睡眠问题的横向入口，帮助用户在专题之间流转。 */
function OtherProblems({ currentSlug }: { currentSlug: string }) {
  const others = getPublishedProblems().filter((p) => p.slug !== currentSlug)
  if (others.length === 0) return null

  return (
    <section className="border-t border-sand-200 pt-8">
      <h2 className="text-[15px] font-bold tracking-tight text-ink-950">其他睡眠问题</h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {others.map((problem) => (
          <li key={problem.slug}>
            <Link
              href={problemPath(problem.slug)}
              className="inline-flex rounded-full border border-sand-300 bg-white px-3.5 py-1.5 text-[13px] text-sand-700 transition-colors hover:border-ink-300 hover:text-ink-800"
            >
              {problem.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
