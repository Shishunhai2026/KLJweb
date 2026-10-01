import { getPublishedArticles } from './articles'
import { getPublishedProblems } from './problems'
import { getPublishedProductKnowledge } from './product'

/**
 * 站内链接图校验（需求文档 §39）。
 *
 * 目标是把 300 篇文章连成一张网，而不是 300 个互相孤立的页面：
 * 每篇文章至少链接 3 篇相关文章 + 1 个睡眠问题专题，
 * 并且不允许存在「没有任何入链」的孤儿页面。
 *
 * 这个模块同时在 content:lint 与单元测试里运行。
 */

export interface LinkGraphIssue {
  severity: 'error' | 'warning'
  /** 出问题的内容标识，便于定位 */
  subject: string
  message: string
}

export function validateLinkGraph(): LinkGraphIssue[] {
  const issues: LinkGraphIssue[] = []

  const articles = getPublishedArticles()
  const problems = getPublishedProblems()
  const products = getPublishedProductKnowledge()

  const articleSlugs = new Set(articles.map((a) => a.slug))
  const problemSlugs = new Set(problems.map((p) => p.slug))
  const productSlugs = new Set(products.map((p) => p.slug))

  // 入链计数，用于孤儿页检测
  const inbound = new Map<string, number>()
  for (const slug of articleSlugs) inbound.set(slug, 0)

  for (const article of articles) {
    const subject = `文章 ${article.slug}`

    // 1. 相关文章必须存在
    const resolved = article.relatedArticleSlugs.filter((slug) => {
      if (articleSlugs.has(slug)) return true
      issues.push({
        severity: 'error',
        subject,
        message: `relatedArticleSlugs 指向了不存在的文章：${slug}`,
      })
      return false
    })

    // Schema 已保证「列出」至少 3 个，这里保证「能解析」的至少 3 个
    if (resolved.length < 3) {
      issues.push({
        severity: 'error',
        subject,
        message: `可解析的相关文章只有 ${resolved.length} 篇，要求至少 3 篇`,
      })
    }

    for (const slug of resolved) {
      inbound.set(slug, (inbound.get(slug) ?? 0) + 1)
    }

    // 2. 睡眠问题专题必须存在
    if (!problemSlugs.has(article.problemSlug)) {
      issues.push({
        severity: 'error',
        subject,
        message: `problemSlug 指向了不存在的睡眠问题专题：${article.problemSlug}`,
      })
    }

    // 3. 产品资料链接（可选）必须存在
    for (const slug of article.productKnowledgeSlugs ?? []) {
      if (!productSlugs.has(slug)) {
        issues.push({
          severity: 'error',
          subject,
          message: `productKnowledgeSlugs 指向了不存在的产品资料：${slug}`,
        })
      }
    }
  }

  // 4. 孤儿页检测：没有任何文章链接过来的页面很难被搜索引擎发现
  for (const [slug, count] of inbound) {
    if (count === 0) {
      issues.push({
        severity: 'warning',
        subject: `文章 ${slug}`,
        message: '没有任何其他文章链接到这篇，将成为孤儿页面',
      })
    }
  }

  // 5. 专题页至少要有一篇关联文章，否则专题页会显得空
  for (const problem of problems) {
    const related = articles.filter((a) => a.problemSlug === problem.slug).length
    if (related === 0) {
      issues.push({
        severity: 'warning',
        subject: `睡眠问题 ${problem.slug}`,
        message: '没有任何文章归属到该专题',
      })
    }
  }

  return issues
}

/** 只返回阻断构建的错误（warning 不阻断）。 */
export function getBlockingLinkIssues(): LinkGraphIssue[] {
  return validateLinkGraph().filter((i) => i.severity === 'error')
}
