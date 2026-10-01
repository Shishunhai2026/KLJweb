import { loadYamlCollection } from './client'
import type { SleepProblem } from './schemas/problem'
import { sleepProblemSchema } from './schemas/problem'
import { HOME_PROBLEM_ENTRIES, SLEEP_PROBLEM_CATEGORIES, type SleepProblemCategory } from './taxonomy'

/**
 * 睡眠问题专题（需求文档 §7）。
 *
 * UI 层一律把 possibleFactors 渲染为「可能相关因素」，
 * 绝不出现「原因 / 病因」——「原因」断言因果，对特殊膳食是疾病宣称风险。
 */

let cache: SleepProblem[] | null = null

export function getAllProblems(): SleepProblem[] {
  cache ??= loadYamlCollection('sleep-problems', sleepProblemSchema)
    .map((file) => file.data)
    .sort((a, b) => a.order - b.order)
  return cache
}

export function getPublishedProblems(): SleepProblem[] {
  return getAllProblems().filter((p) => p.status === 'published')
}

export function getProblemBySlug(slug: string): SleepProblem | undefined {
  return getPublishedProblems().find((p) => p.slug === slug)
}

export function getProblemByCategory(category: SleepProblemCategory): SleepProblem | undefined {
  return getPublishedProblems().find((p) => p.category === category)
}

export function getAllProblemSlugs(): string[] {
  return getPublishedProblems().map((p) => p.slug)
}

/** 分类的中文名，供导航与面包屑使用。 */
export function getProblemLabel(category: SleepProblemCategory): string {
  return SLEEP_PROBLEM_CATEGORIES.find((c) => c.slug === category)?.label ?? category
}

/**
 * 首页「你是哪一种睡眠问题？」的四个入口（需求文档 §5.2）。
 * 解析成实际存在的专题页，缺失的入口会被跳过而不是渲染成死链。
 */
export function getHomeProblemEntries(): {
  problem: SleepProblem
  title: string
  summary: string
}[] {
  const entries: { problem: SleepProblem; title: string; summary: string }[] = []
  for (const entry of HOME_PROBLEM_ENTRIES) {
    const problem = getProblemByCategory(entry.category)
    if (problem) {
      entries.push({ problem, title: entry.title, summary: entry.summary })
    }
  }
  return entries
}

export function __resetProblemCache(): void {
  cache = null
}
