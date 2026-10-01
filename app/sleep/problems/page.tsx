import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { Container } from '@/components/layout/Container'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { getPublishedProblems } from '@/lib/content'
import { HOME_CRUMB, SECTION_CRUMBS } from '@/lib/seo/breadcrumbs'
import { buildMetadata } from '@/lib/seo/metadata'
import { problemPath } from '@/lib/seo/routes'

export const metadata: Metadata = buildMetadata({
  title: '睡眠问题',
  description:
    '入睡困难、夜间易醒、早醒、睡眠浅——按表现分类的睡眠问题专题，逐项说明常见表现、可能相关的因素与可以尝试的改善方法。',
  path: '/sleep/problems',
  keywords: ['睡眠问题', '入睡困难', '夜间易醒', '早醒', '睡眠浅', '失眠怎么办'],
})

export default function ProblemsIndexPage() {
  const problems = getPublishedProblems()

  return (
    <>
      <div className="border-b border-sand-200 bg-white">
        <Container size="wide" className="py-8">
          <Breadcrumbs crumbs={[HOME_CRUMB, SECTION_CRUMBS.sleep, SECTION_CRUMBS.sleepProblems]} />
          <h1 className="mt-5 text-[1.75rem] font-bold leading-tight tracking-tight text-ink-950 sm:text-[2rem]">
            睡眠问题
          </h1>
          <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-sand-600">
            不同表现背后的相关因素不同，改善方向也不一样。
            先找到最接近自己的那一类，再逐一排查。
          </p>
        </Container>
      </div>

      <Container size="wide" className="py-10">
        {problems.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {problems.map((problem) => (
              <li key={problem.slug}>
                <Link
                  href={problemPath(problem.slug)}
                  className="group flex h-full flex-col rounded-card border border-sand-200 bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-ink-200 hover:shadow-card-hover"
                >
                  <h2 className="text-[16.5px] font-bold text-ink-950">{problem.title}</h2>
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
        ) : (
          <p className="text-[14.5px] text-sand-600">睡眠问题专题正在整理中。</p>
        )}
      </Container>
    </>
  )
}
