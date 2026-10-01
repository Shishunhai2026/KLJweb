import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { Container } from '@/components/layout/Container'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { ButtonLink } from '@/components/ui/Button'
import { getPublishedProblems } from '@/lib/content'
import { ARTICLE_CATEGORIES } from '@/lib/content/taxonomy'
import { HOME_CRUMB, SECTION_CRUMBS } from '@/lib/seo/breadcrumbs'
import { buildMetadata } from '@/lib/seo/metadata'
import { problemPath } from '@/lib/seo/routes'
import { PRIMARY_CTA } from '@/lib/nav'

export const metadata: Metadata = buildMetadata({
  title: '认识睡眠',
  description:
    '认识睡眠的四个入口：睡眠基础知识、常见睡眠问题、可操作的改善方法，以及营养与睡眠的关系。',
  path: '/sleep',
  keywords: ['认识睡眠', '睡眠知识', '睡眠问题', '睡眠改善', '睡眠营养'],
})

export default function SleepHubPage() {
  const problems = getPublishedProblems()

  return (
    <>
      <div className="border-b border-sand-200 bg-white">
        <Container size="wide" className="py-8">
          <Breadcrumbs crumbs={[HOME_CRUMB, SECTION_CRUMBS.sleep]} />
          <h1 className="mt-5 text-[1.75rem] font-bold leading-tight tracking-tight text-ink-950 sm:text-[2rem]">
            认识睡眠
          </h1>
          <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-sand-600">
            从了解睡眠本身开始，再找到最接近自己的问题类型，最后看具体能做什么。
          </p>
        </Container>
      </div>

      <Container size="wide" className="py-10">
        <section>
          <h2 className="text-[17px] font-bold tracking-tight text-ink-950">按主题浏览</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        </section>

        {problems.length > 0 ? (
          <section className="mt-12">
            <h2 className="text-[17px] font-bold tracking-tight text-ink-950">
              你是哪一种睡眠问题？
            </h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {problems.slice(0, 8).map((problem) => (
                <li key={problem.slug}>
                  <Link
                    href={problemPath(problem.slug)}
                    className="group flex h-full flex-col rounded-card border border-sand-200 bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-ink-200 hover:shadow-card-hover"
                  >
                    <h3 className="text-[15.5px] font-bold text-ink-950">{problem.title}</h3>
                    <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-sand-600">
                      {problem.symptoms[0]}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-600">
                      查看专题
                      <ArrowRight
                        className="size-3.5 transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-12 rounded-2xl border border-ink-100 bg-ink-50/60 p-8 text-center">
          <h2 className="text-lg font-bold text-ink-950">不确定自己属于哪一类？</h2>
          <p className="mx-auto mt-3 max-w-xl text-[14.5px] leading-relaxed text-sand-600">
            用 ISI 失眠严重程度指数量表做一次自测，约 2 分钟，
            会得到一份包含当前睡眠情况与改善建议的结果。
          </p>
          <ButtonLink href={PRIMARY_CTA.href} size="lg" className="mt-6">
            {PRIMARY_CTA.label}
          </ButtonLink>
        </section>
      </Container>
    </>
  )
}
