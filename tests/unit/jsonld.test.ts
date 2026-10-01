import { describe, expect, it } from 'vitest'

import { buildArticleLd, buildMedicalWebPageLd } from '@/lib/seo/jsonld'

/**
 * 结构化数据的回归防线。
 *
 * 为什么这组断言必须存在：本次相关的两个字段（`lastReviewed`、`reviewedBy`）
 * 都是**条件展开**进对象的，而 TypeScript 不对展开的属性做多余属性检查——
 * 也就是说 schema-dts 拦不住这里的字段名写错，写错了也不会编译失败，
 * 只会静默地让搜索特性失效（这正是 B2 那个 bug 藏了这么久的原因）。
 *
 * 所以这里改用运行时断言，字段名与取值都必须真的出现。
 */

const BASE = {
  headline: '什么是深度睡眠？',
  description: '深度睡眠是身体修复最集中的阶段。',
  path: '/knowledge/what-is-deep-sleep',
  publishedTime: '2026-10-01',
  modifiedTime: '2026-10-01',
  authorName: '和颐林睡眠研究团队',
}

describe('文章 JSON-LD —— 审核信息', () => {
  it('给了审核时间与审核人 → 两者都输出，且成对', () => {
    const ld = buildArticleLd({
      ...BASE,
      reviewedTime: '2026-10-01',
      reviewerName: '田宗高',
    })

    expect(ld).toHaveProperty('lastReviewed', '2026-10-01')
    expect(ld).toHaveProperty('reviewedBy', { '@type': 'Person', name: '田宗高' })
  })

  it('没有审核时间 → 不输出 lastReviewed（不留空字段）', () => {
    const ld = buildArticleLd({ ...BASE, reviewerName: '田宗高' })

    expect(ld).not.toHaveProperty('lastReviewed')
  })

  it('没有审核人 → 不输出 reviewedBy', () => {
    const ld = buildArticleLd(BASE)

    expect(ld).not.toHaveProperty('reviewedBy')
    expect(ld).not.toHaveProperty('lastReviewed')
  })

  it('作者与更新时间始终输出', () => {
    const ld = buildArticleLd(BASE)

    expect(ld).toHaveProperty('author', { '@type': 'Person', name: '和颐林睡眠研究团队' })
    expect(ld).toHaveProperty('dateModified', '2026-10-01')
  })
})

describe('睡眠问题专题 JSON-LD —— 审核信息', () => {
  it('MedicalWebPage 同样输出 lastReviewed 与 reviewedBy', () => {
    const ld = buildMedicalWebPageLd({
      name: '夜间易醒',
      description: '夜间易醒的常见原因。',
      path: '/sleep/problems/night-awakening',
      modifiedTime: '2026-10-01',
      reviewedTime: '2026-10-01',
      reviewerName: '田宗高',
    })

    expect(ld).toHaveProperty('lastReviewed', '2026-10-01')
    expect(ld).toHaveProperty('reviewedBy', { '@type': 'Person', name: '田宗高' })
  })
})
