import type { Metadata } from 'next'
import { ArrowRight, FlaskConical, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

import { ArticleCard } from '@/components/article/ArticleCard'
import { BodySymptoms } from '@/components/home/BodySymptoms'
import { DeepImpact } from '@/components/home/DeepImpact'
import { Hero } from '@/components/home/Hero'
import { HeroIntro } from '@/components/home/HeroIntro'
import { ProblemEntries } from '@/components/home/ProblemEntries'
import { Container } from '@/components/layout/Container'
import { ButtonLink } from '@/components/ui/Button'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { getFeaturedArticles } from '@/lib/content'
import { ARTICLE_CATEGORIES } from '@/lib/content/taxonomy'
import { buildMetadata } from '@/lib/seo/metadata'
import { PRIMARY_CTA } from '@/lib/nav'
import { SITE } from '@/lib/seo/site'

export const metadata: Metadata = buildMetadata({
  title: `${SITE.name}｜${SITE.tagline}`,
  description: SITE.description,
  path: '/',
  keywords: [
    '睡眠',
    '睡眠质量',
    '深度睡眠',
    '睡眠自测',
    '失眠怎么办',
    '入睡困难',
    '半夜醒来',
    '早醒',
    '和颐林睡眠大师',
  ],
  absoluteTitle: true,
})

export default function HomePage() {
  const featured = getFeaturedArticles(6)

  return (
    <>
      {/*
        页面顺序是一条叙事线，不要随意调换：
          0. 轮播 banner —— 客户提供的画面独占第一屏，先立住品牌印象
          1. 主标题与第一 CTA —— 承接 banner，先说人话、给出口
          2. 身体症状 —— 让人对号入座，产生「说的就是我」的共情
          3. 深层次影响 —— 说明为什么值得重视，把「今晚难受」升级为「长期问题」
          4. 你是哪一种睡眠问题 —— 在用户已经在意之后，才引导他分类与深入
        把「你是哪一种」放在最前，等于在用户还没在意时就要求他自我诊断，
        这一步通常会直接流失。顺序调整过，别再改回去。

        注意：第 0 屏（banner）与第 1 屏（HeroIntro）是两屏而不是一屏，
        站内文案不叠加在 banner 上——banner 图内自带标题，叠加会变成两套文字打架。
      */}
      <Hero />
      <HeroIntro />
      <BodySymptoms />
      <DeepImpact />
      <ProblemEntries />

      {/* 知识精选 */}
      {featured.length > 0 ? (
        <section className="border-t border-sand-200 bg-white py-16 sm:py-20">
          <Container size="wide">
            <SectionHeading
              title="睡眠知识精选"
              description="从基础概念到常见问题，用通俗的方式讲清楚睡眠是怎么一回事。"
              action={
                <Link
                  href="/knowledge"
                  className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-ink-700 transition-colors hover:text-ink-900"
                >
                  进入睡眠知识库
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              }
            />
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((article) => (
                <li key={article.slug}>
                  <ArticleCard article={article} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : (
        <KnowledgeCategories />
      )}

      <EvidenceSection />

      {/* 产品入口 —— 按需求文档的漏斗顺序，产品放在内容的最后 */}
      <section className="border-t border-sand-200 bg-white py-16 sm:py-20">
        <Container size="wide">
          <div className="overflow-hidden rounded-2xl border border-sand-200 bg-night-gradient p-8 sm:p-12">
            <div className="max-w-2xl">
              <p className="text-[12.5px] font-medium tracking-[0.16em] text-gold-300">
                和颐林 · 睡眠大师
              </p>
              <h2 className="mt-3 text-xl font-bold tracking-tight text-white sm:text-2xl">
                了解产品配方、检测资料与研究资料
              </h2>
              <p className="mt-4 text-[14.5px] leading-relaxed text-ink-200">
                产品中心完整展示配料、使用方法、检测项目与相关资料，
                并对每一条资料来源标注证据等级与核验状态。
                它不是药品，不能用于治疗疾病。
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <ButtonLink href="/product" variant="gold">
                  进入产品中心
                  <ArrowRight className="size-4" aria-hidden="true" />
                </ButtonLink>
                <ButtonLink href="/product/faq" variant="onDark">
                  查看产品常见问题
                </ButtonLink>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 收尾 CTA */}
      <section className="border-t border-sand-200 py-16">
        <Container size="narrow" className="text-center">
          <h2 className="text-xl font-bold tracking-tight text-ink-950">
            先用几分钟，了解自己的睡眠状况
          </h2>
          <p className="mt-3 text-[14.5px] leading-relaxed text-sand-600">
            7 个问题，约 2 分钟。测完会得到一份包含当前睡眠情况、
            可能存在的主要问题与改善建议的结果。
          </p>
          <ButtonLink href={PRIMARY_CTA.href} size="lg" className="mt-7">
            {PRIMARY_CTA.label}
            <ArrowRight className="size-4" aria-hidden="true" />
          </ButtonLink>
          <p className="mt-4 text-[12.5px] text-sand-500">
            本测试用于睡眠情况筛查和健康教育，不能替代医生诊断。
          </p>
        </Container>
      </section>
    </>
  )
}

/** 内容为空时，展示知识库的四个分类入口，避免首页出现空白区块。 */
function KnowledgeCategories() {
  return (
    <section className="border-t border-sand-200 bg-white py-16 sm:py-20">
      <Container size="wide">
        <SectionHeading
          title="睡眠知识库"
          description="按主题组织的睡眠知识，持续更新中。"
        />
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ARTICLE_CATEGORIES.filter((c) => c.slug !== 'product-brand').map((category) => (
            <li key={category.slug}>
              <Link
                href={category.path}
                className="group flex h-full flex-col rounded-card border border-sand-200 bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-ink-200 hover:shadow-card-hover"
              >
                <h3 className="text-[15.5px] font-bold text-ink-950">{category.label}</h3>
                <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-sand-600">
                  {category.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-600">
                  进入栏目
                  <ArrowRight
                    className="size-3.5 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}

/**
 * 证据等级说明。
 *
 * 这个区块是本站在同类站点里最不一样的地方：
 * 主动告诉读者「哪些资料强、哪些资料只是企业提供的」，
 * 而不是把所有内容混在一起当成结论。信任建立在这里。
 */
function EvidenceSection() {
  const levels = [
    {
      level: 'Level 1–2',
      label: '公开资料与公开发表研究',
      detail: '教材、指南、同行评议期刊论文。可作为一般性知识引用。',
      strong: true,
    },
    {
      level: 'Level 3–5',
      label: '企业提供的资料',
      detail: '产品相关研究、检测报告与宣传资料。均标注「企业提供资料，待独立核验」。',
      strong: false,
    },
    {
      level: 'Level 6',
      label: '用户体验',
      detail: '个人使用感受，存在个体差异，不构成产品功效保证。',
      strong: false,
    },
  ]

  return (
    <section className="border-t border-sand-200 py-16 sm:py-20">
      <Container size="wide">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-positive-50 px-3 py-1 text-[12px] font-medium text-positive-700">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              证据分级
            </span>
            <h2 className="mt-4 text-xl font-bold tracking-tight text-ink-950 sm:text-2xl">
              我们会告诉你，每条资料是从哪来的
            </h2>
            <p className="mt-4 text-[14.5px] leading-relaxed text-sand-600">
              健康信息最有价值的部分，往往不是结论本身，而是结论的来源有多可靠。
              本站的每一条研究、检测与产品数据都标注了证据等级，
              来自企业的资料会明确写出核验状态，不会被包装成医学结论。
            </p>
            <Link
              href="/product"
              className="mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-ink-700 transition-colors hover:text-ink-900"
            >
              <FlaskConical className="size-3.5" aria-hidden="true" />
              查看产品资料与核验状态
            </Link>
          </div>

          <dl className="space-y-3">
            {levels.map((item) => (
              <div
                key={item.level}
                className="rounded-card border border-sand-200 bg-white p-5 shadow-card"
              >
                <div className="flex flex-wrap items-center gap-2.5">
                  <dt
                    className={
                      item.strong
                        ? 'rounded-full bg-positive-50 px-2.5 py-0.5 text-[11.5px] font-semibold text-positive-700'
                        : 'rounded-full bg-caution-50 px-2.5 py-0.5 text-[11.5px] font-semibold text-caution-700'
                    }
                  >
                    {item.level}
                  </dt>
                  <span className="text-[14.5px] font-bold text-ink-950">{item.label}</span>
                </div>
                <dd className="mt-2 text-[13.5px] leading-relaxed text-sand-600">{item.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  )
}
