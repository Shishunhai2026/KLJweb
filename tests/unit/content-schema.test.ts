import { describe, expect, it } from 'vitest'

import { articleSchema } from '@/lib/content/schemas/article'
import { sourceRefSchema } from '@/lib/content/schemas/common'
import { productClaimSchema } from '@/lib/content/schemas/product'
import { leadSubmissionSchema } from '@/lib/content/schemas/lead'
import { makeArticleInput, makeSource } from '../fixtures/content'

/**
 * 这组测试是「构建失败闸门」的自检：
 * 它证明 Schema 确实拦得住 300 篇 LLM 生成内容里最危险的几类错误。
 */

describe('文章 Schema —— 正样本', () => {
  it('合法文章通过', () => {
    const result = articleSchema.safeParse(makeArticleInput())
    expect(result.success, JSON.stringify(result.error?.issues)).toBe(true)
  })

  it('审核人与审核日期成对填写 → 通过', () => {
    const result = articleSchema.safeParse(
      makeArticleInput({
        needsMedicalReview: true,
        reviewerId: 'tian-zonggao',
        lastReviewedAt: '2026-10-01',
      }),
    )
    expect(result.success, JSON.stringify(result.error?.issues)).toBe(true)
  })

  it('填了审核日期却没有审核人 → 拒绝', () => {
    // 没人认领的审核日期，比不写更容易被读成「有人审过」。
    const result = articleSchema.safeParse(
      makeArticleInput({ lastReviewedAt: '2026-10-01', reviewerId: undefined }),
    )
    expect(result.success).toBe(false)
  })
})

describe('文章 Schema —— 负样本必须失败', () => {
  it('FAQ 少于 5 个 → 拒绝（需求文档 §29 要求至少 5 个）', () => {
    const base = makeArticleInput()
    const result = articleSchema.safeParse({ ...base, faq: base.faq.slice(0, 4) })
    expect(result.success).toBe(false)
  })

  it('相关文章少于 3 篇 → 拒绝（需求文档 §39）', () => {
    const base = makeArticleInput()
    const result = articleSchema.safeParse({
      ...base,
      relatedArticleSlugs: base.relatedArticleSlugs.slice(0, 2),
    })
    expect(result.success).toBe(false)
  })

  it('keyFacts 引用了不存在的来源 → 拒绝', () => {
    const result = articleSchema.safeParse(
      makeArticleInput({
        keyFacts: [{ statement: '某个结论', sourceId: '不存在的来源', evidenceLevel: 1 }],
      }),
    )
    expect(result.success).toBe(false)
  })

  it('引用了 Level 3 资料却没有标记需要医学审核 → 拒绝', () => {
    const result = articleSchema.safeParse(
      makeArticleInput({
        sources: [makeSource({ evidenceLevel: 5, verification: 'company-only' })],
        needsMedicalReview: false,
      }),
    )
    expect(result.success).toBe(false)
  })

  it('睡眠问题分类的文章没有标记医学审核 → 拒绝', () => {
    const result = articleSchema.safeParse(
      makeArticleInput({ category: 'sleep-problems', needsMedicalReview: false }),
    )
    expect(result.success).toBe(false)
  })

  it('需要医学审核但没有审核人 → 拒绝', () => {
    const result = articleSchema.safeParse(
      makeArticleInput({ needsMedicalReview: true, reviewerId: undefined }),
    )
    expect(result.success).toBe(false)
  })

  it('把自己列为相关文章 → 拒绝', () => {
    const base = makeArticleInput()
    const result = articleSchema.safeParse({
      ...base,
      relatedArticleSlugs: [base.slug, 'other-a', 'other-b'],
    })
    expect(result.success).toBe(false)
  })

  it('相关文章重复 → 拒绝（否则页面只渲染出 2 个链接）', () => {
    const result = articleSchema.safeParse(
      makeArticleInput({ relatedArticleSlugs: ['a-1', 'a-1', 'a-2'] }),
    )
    expect(result.success).toBe(false)
  })

  it('updatedAt 早于 publishedAt → 拒绝', () => {
    const result = articleSchema.safeParse(
      makeArticleInput({ publishedAt: '2026-05-01', updatedAt: '2026-01-01' }),
    )
    expect(result.success).toBe(false)
  })

  it('核心结论少于 3 条 → 拒绝', () => {
    const result = articleSchema.safeParse(
      makeArticleInput({ coreConclusions: ['只有一条结论'] }),
    )
    expect(result.success).toBe(false)
  })

  it('slug 含大写或中文 → 拒绝', () => {
    expect(articleSchema.safeParse(makeArticleInput({ slug: 'Sleep-Cycle' })).success).toBe(false)
    expect(articleSchema.safeParse(makeArticleInput({ slug: '睡眠周期' })).success).toBe(false)
  })
})

describe('来源 Schema', () => {
  it('Level 1–2 可标记为独立核验', () => {
    expect(sourceRefSchema.safeParse(makeSource({ evidenceLevel: 2 })).success).toBe(true)
  })

  it('Level 3+ 不允许标记为独立核验', () => {
    const result = sourceRefSchema.safeParse(
      makeSource({ evidenceLevel: 5, verification: 'independent' }),
    )
    expect(result.success).toBe(false)
  })

  it('Level 3+ 必须标明核验状态', () => {
    expect(
      sourceRefSchema.safeParse(
        makeSource({ evidenceLevel: 4, verification: 'company-only' }),
      ).success,
    ).toBe(true)
  })
})

describe('产品表述 Schema（需求文档 §11、§44）', () => {
  const base = {
    claim: '某项检测结果',
    sourceId: 'src-1',
    verificationStatus: 'verified-company' as const,
    evidenceLevel: 4 as const,
  }

  it('企业资料不能写成中性事实陈述', () => {
    expect(productClaimSchema.safeParse({ ...base, wording: 'factual' }).success).toBe(false)
    expect(productClaimSchema.safeParse({ ...base, wording: 'company-claim' }).success).toBe(true)
  })

  it('标记为 disputed 必须说明矛盾点', () => {
    const result = productClaimSchema.safeParse({
      ...base,
      wording: 'company-claim',
      verificationStatus: 'disputed',
    })
    expect(result.success).toBe(false)

    // 真实场景：同一份资料里 SOD 活性同时写了 3320U 与 332U
    const withReason = productClaimSchema.safeParse({
      ...base,
      wording: 'company-claim',
      verificationStatus: 'disputed',
      disputedReason: '同一份资料中 SOD 活性分别记载为 3320U 与 332U，待客户确认',
    })
    expect(withReason.success).toBe(true)
  })

  it('Level 1–2 的资料可以作为事实陈述', () => {
    expect(
      productClaimSchema.safeParse({ ...base, evidenceLevel: 2, wording: 'factual' }).success,
    ).toBe(true)
  })
})

describe('线索 Schema（需求文档 §34）', () => {
  const validLead = {
    phone: '13800138000',
    source: 'baidu' as const,
    landingPage: '/sleep/problems/night-awakening',
    consent: { privacyAccepted: true as const, policyVersion: 'v1' },
  }

  it('合法线索通过', () => {
    expect(leadSubmissionSchema.safeParse(validLead).success).toBe(true)
  })

  it('既无手机号也无微信号 → 拒绝', () => {
    const result = leadSubmissionSchema.safeParse({ ...validLead, phone: undefined })
    expect(result.success).toBe(false)
  })

  it('手机号格式非法 → 拒绝', () => {
    expect(leadSubmissionSchema.safeParse({ ...validLead, phone: '12345' }).success).toBe(false)
    expect(leadSubmissionSchema.safeParse({ ...validLead, phone: '23800138000' }).success).toBe(false)
  })

  it('未同意隐私政策 → 拒绝', () => {
    const result = leadSubmissionSchema.safeParse({
      ...validLead,
      consent: { privacyAccepted: false, policyVersion: 'v1' },
    })
    expect(result.success).toBe(false)
  })

  it('完全缺少 consent → 拒绝', () => {
    const result = leadSubmissionSchema.safeParse({ ...validLead, consent: undefined })
    expect(result.success).toBe(false)
  })

  it('只填微信号也可以', () => {
    const result = leadSubmissionSchema.safeParse({
      ...validLead,
      phone: undefined,
      wechat: 'sleep_master01',
    })
    expect(result.success).toBe(true)
  })

  it('分数与分级必须同时提供', () => {
    expect(
      leadSubmissionSchema.safeParse({ ...validLead, testScore: 15 }).success,
    ).toBe(false)
    expect(
      leadSubmissionSchema.safeParse({ ...validLead, testScore: 15, testSeverity: 'moderate' })
        .success,
    ).toBe(true)
  })

  it('分数越界 → 拒绝', () => {
    expect(
      leadSubmissionSchema.safeParse({ ...validLead, testScore: 29, testSeverity: 'severe' })
        .success,
    ).toBe(false)
  })
})
