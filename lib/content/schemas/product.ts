import { z } from 'zod'

import { productSectionSchema } from '../taxonomy'
import {
  contentStatusSchema,
  evidenceLevelSchema,
  isoDateSchema,
  slugSchema,
  sourceRefSchema,
} from './common'

/**
 * 产品表述（需求文档 §11、§44）。
 *
 * 这是产品页上「所有数字与功效表述」的唯一合法容器。
 * 产品页的 MDX 正文里不允许出现裸数字或功效动词——由 content:lint 强制：
 * 正文中出现的数字必须在同一个文件的 claims[] 里登记来源，否则构建失败。
 */
export const productClaimSchema = z
  .object({
    claim: z.string().min(4).max(300),
    /** 数值型结论，如 '93.3%'、'1940μg/kg' */
    value: z.string().max(60).optional(),
    sourceId: z.string().min(1).max(80),
    evidenceLevel: evidenceLevelSchema,
    /** factual=中性事实陈述 / company-claim=企业主张 / testimonial=用户体验 */
    wording: z.enum(['factual', 'company-claim', 'testimonial']),
    verificationStatus: z.enum(['verified-company', 'pending-independent', 'disputed']),
    disclaimer: z.string().max(500).optional(),
    /** verificationStatus 为 disputed 时必须说明矛盾点 */
    disputedReason: z.string().max(500).optional(),
  })
  .refine((c) => c.verificationStatus !== 'disputed' || Boolean(c.disputedReason), {
    message: '标记为 disputed 的表述必须填写 disputedReason',
    path: ['disputedReason'],
  })
  // 企业自己的宣传口径不得写成中性事实
  .refine((c) => !(c.evidenceLevel >= 3 && c.wording === 'factual'), {
    message: 'Level 3 及以上的资料不能作为中性事实陈述（wording 不得为 factual）',
    path: ['wording'],
  })

/** 产品知识条目（需求文档 §11 product_knowledge）。 */
export const productKnowledgeSchema = z
  .object({
    id: z.string().min(1).max(80),
    slug: slugSchema,
    section: productSectionSchema,
    title: z.string().min(2).max(60),
    summary: z.string().min(20).max(300),
    /** MDX 正文 */
    body: z.string().min(50),

    claims: z.array(productClaimSchema).default([]),
    sources: z.array(sourceRefSchema).default([]),
    evidenceLevel: evidenceLevelSchema,

    relatedArticleSlugs: z.array(slugSchema).default([]),
    order: z.number().int().min(0),
    status: contentStatusSchema,
    updatedAt: isoDateSchema,
  })
  // claims 里引用的 sourceId 必须存在
  .refine((p) => p.claims.every((c) => p.sources.some((s) => s.id === c.sourceId)), {
    message: 'claims 中的 sourceId 必须存在于 sources 中',
    path: ['claims'],
  })

export type ProductClaim = z.infer<typeof productClaimSchema>
export type ProductKnowledge = z.infer<typeof productKnowledgeSchema>
