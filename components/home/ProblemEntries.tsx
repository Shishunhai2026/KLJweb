import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { Container } from '@/components/layout/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { getHomeProblemEntries } from '@/lib/content'
import { HOME_PROBLEM_ENTRIES } from '@/lib/content/taxonomy'
import { problemPath } from '@/lib/seo/routes'

/**
 * 首页第四屏：你是哪一种睡眠问题？（需求文档 §5.2）
 *
 * 位置说明：这一屏刻意不放在前面。
 * 用户刚进站时对自己「属于哪一类」往往没有概念，
 * 此时要求他分类会直接流失。先看过症状与长期影响、
 * 产生「我确实该管管了」的念头之后，这个入口才有人愿意点。
 *
 * 四个入口的文案、顺序来自 HOME_PROBLEM_ENTRIES；
 * 链接目标通过「分类 → 专题页」解析得到。
 * 如果某个专题页还没建，就退回到睡眠问题总览页——绝不渲染死链。
 */
export function ProblemEntries() {
  const resolved = getHomeProblemEntries()

  const entries =
    resolved.length > 0
      ? resolved.map((entry) => ({
          title: entry.title,
          summary: entry.summary,
          href: problemPath(entry.problem.slug),
        }))
      : HOME_PROBLEM_ENTRIES.map((entry) => ({
          title: entry.title,
          summary: entry.summary,
          href: '/sleep/problems',
        }))

  return (
    <section className="py-16 sm:py-20">
      <Container size="wide">
        <SectionHeading
          title="你是哪一种睡眠问题？"
          description="不同表现背后的可能相关因素不同，改善方向也不一样。先找到最接近自己的那一类。"
          action={
            <Link
              href="/sleep/problems"
              className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-ink-700 transition-colors hover:text-ink-900"
            >
              查看全部睡眠问题
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          }
        />

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {entries.map((entry) => (
            <li key={entry.title}>
              <Link
                href={entry.href}
                className="group flex h-full flex-col rounded-card border border-sand-200 bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-ink-200 hover:shadow-card-hover"
              >
                <h3 className="text-[16px] font-bold text-ink-950">{entry.title}</h3>
                <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-sand-600">
                  {entry.summary}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-600">
                  了解这一类
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
