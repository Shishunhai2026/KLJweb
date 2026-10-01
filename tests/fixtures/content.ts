/**
 * 测试夹具。
 *
 * 每个工厂都返回一份**合法**的数据，测试再针对性地破坏其中一个字段，
 * 以此确认 Schema 精确地拦住了它该拦的东西（而不是碰巧因为别的错误失败）。
 */

import type { ArticleInput } from '@/lib/content/schemas/article'
import type { SourceRef } from '@/lib/content/schemas/common'

export function makeSource(overrides: Partial<SourceRef> = {}): SourceRef {
  return {
    id: 'src-1',
    title: '某公开教材',
    publisher: '某出版社',
    evidenceLevel: 1,
    verification: 'independent',
    ...overrides,
  }
}

export function makeArticleInput(overrides: Partial<ArticleInput> = {}): ArticleInput {
  return {
    slug: 'what-is-sleep-cycle',
    title: '什么是睡眠周期',
    summary: '睡眠周期是理解睡眠结构的基础概念，本文说明其构成与常见时长。',
    category: 'sleep-basic',
    tags: ['睡眠基础'],
    quickAnswer:
      '睡眠周期是睡眠由浅入深再回到浅睡的循环过程，一个周期通常持续 90 到 110 分钟，一夜会经历 4 到 6 个周期。',
    coreConclusions: [
      '一个睡眠周期约 90 至 110 分钟。',
      '成年人一夜通常经历 4 到 6 个周期。',
      '深睡眠多集中在前半夜，REM 睡眠多集中在后半夜。',
    ],
    keyFacts: [],
    faq: [
      {
        question: '睡眠周期一般是多长时间？',
        answer: '一个完整的睡眠周期通常持续 90 到 110 分钟，包括浅睡眠、深睡眠和快速眼动睡眠三个阶段。',
      },
      {
        question: '一晚上会经历几个睡眠周期？',
        answer: '大多数成年人一夜会经历 4 到 6 个睡眠周期。周期数量会随总睡眠时长变化，睡得越久周期越多。',
      },
      {
        question: '为什么后半夜更容易做梦？',
        answer: '快速眼动睡眠在后半夜占比更高，而梦境主要发生在这一阶段，因此后半夜醒来时更容易记得梦的内容。',
      },
      {
        question: '睡眠周期会随年龄变化吗？',
        answer: '会。随着年龄增长，深睡眠占比通常逐渐减少，夜间醒来的次数可能增多，这是正常的生理变化。',
      },
      {
        question: '了解睡眠周期有什么用？',
        answer: '了解周期有助于安排作息。由于醒来时若正处于深睡眠容易感到昏沉，尽量在周期结束时起床会更清爽。',
      },
    ],
    sources: [makeSource()],
    authorId: 'editorial',
    needsMedicalReview: false,
    publishedAt: '2026-01-01',
    updatedAt: '2026-01-01',
    relatedArticleSlugs: ['deep-sleep-basics', 'rem-sleep-basics', 'sleep-duration-guide'],
    problemSlug: 'poor-sleep-quality',
    seo: {
      description: '解释睡眠周期的构成与常见时长，说明一夜会经历几个周期，以及深睡眠与 REM 睡眠的分布规律。',
      keywords: ['睡眠周期', '睡眠周期多长时间'],
      intent: 'informational',
      robots: 'index,follow',
    },
    status: 'published',
    ...overrides,
  }
}
