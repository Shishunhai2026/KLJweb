import { z } from 'zod'

import { articleCategorySchema } from '../taxonomy'
import {
  contentStatusSchema,
  faqItemSchema,
  isoDateSchema,
  keyFactSchema,
  seoSchema,
  slugSchema,
  sourceRefSchema,
} from './common'

/** 需要医学审核的分类：涉及症状判断与产品表述。 */
const MEDICAL_REVIEW_CATEGORIES = new Set(['sleep-problems', 'product-brand'])

const articleObjectSchema = z.object({
  /** 必须与文件名一致，由加载器校验，避免 slug 与路径漂移 */
  slug: slugSchema,
  title: z.string().min(4).max(80),
  /** 列表页与 meta description 的共用摘要 */
  summary: z.string().min(20).max(200),
  category: articleCategorySchema,
  tags: z.array(z.string().max(30)).default([]),

  // ---- GEO 区块（需求文档 §29、§30）----
  /** 一句话答案。40–120 字最佳，禁止出现任何产品信息。 */
  quickAnswer: z.string().min(20).max(300),
  /** 核心结论 3–5 条 */
  coreConclusions: z.array(z.string().min(4).max(200)).min(3).max(6),
  keyFacts: z.array(keyFactSchema).default([]),

  // ---- 可被爬取的 FAQ（需求文档 §29 要求至少 5 个）----
  faq: z.array(faqItemSchema).min(5),

  // ---- 来源与审核（需求文档 §31）----
  sources: z.array(sourceRefSchema).min(1),
  authorId: z.string().min(1),
  reviewerId: z.string().min(1).optional(),
  needsMedicalReview: z.boolean(),
  publishedAt: isoDateSchema,
  updatedAt: isoDateSchema,
  /**
   * 上次医学审核日期。**可选**——不涉及医学判断的文章（纯睡眠结构科普）根本没有「审核」这回事。
   * 强行填一个日期，页面就会渲染出一次没发生过的审核（见 components/geo/ReviewMeta.tsx）。
   * 留空时页面隐藏「审核日期」一行，结构化数据也不会出现 lastReviewed。
   */
  lastReviewedAt: isoDateSchema.optional(),

  // ---- 站内链接（需求文档 §39）----
  /** 至少 3 篇相关文章 */
  relatedArticleSlugs: z.array(slugSchema).min(3),
  /** 恰好 1 个睡眠问题专题 */
  problemSlug: slugSchema,
  productKnowledgeSlugs: z.array(slugSchema).optional(),

  seo: seoSchema,
  heroImage: z.string().max(500).optional(),
  ogImage: z.string().max(500).optional(),
  status: contentStatusSchema,
  featured: z.boolean().default(false),
})

export const articleSchema = articleObjectSchema
  // 每条关键事实都必须能追溯到 sources 中真实存在的来源
  .refine(
    (a) => a.keyFacts.every((f) => a.sources.some((s) => s.id === f.sourceId)),
    {
      message: 'keyFacts 中的 sourceId 必须存在于 sources 中',
      path: ['keyFacts'],
    },
  )
  // 涉及症状判断或产品内容的文章，必须经过医学审核流程
  .refine(
    (a) =>
      !(
        MEDICAL_REVIEW_CATEGORIES.has(a.category) ||
        a.sources.some((s) => s.evidenceLevel >= 3)
      ) || a.needsMedicalReview === true,
    {
      message:
        '睡眠问题/产品分类的文章，或引用了 Level 3 及以上资料的文章，必须将 needsMedicalReview 设为 true',
      path: ['needsMedicalReview'],
    },
  )
  // 需要医学审核的必须指定审核人
  .refine((a) => !a.needsMedicalReview || Boolean(a.reviewerId), {
    message: 'needsMedicalReview 为 true 时必须填写 reviewerId',
    path: ['reviewerId'],
  })
  /*
   * 审核日期与审核人必须成对。
   * 只写日期不写人，页面上会出现「审核日期：2026-10-01」却没有任何「资料审核」署名——
   * 一个没人认领的审核日期，比不写更容易被读成「有人审过」。
   */
  .refine((a) => !a.lastReviewedAt || Boolean(a.reviewerId), {
    message: '填写了 lastReviewedAt 就必须同时填写 reviewerId',
    path: ['reviewerId'],
  })
  // 不能把自己列为相关文章
  .refine((a) => !a.relatedArticleSlugs.includes(a.slug), {
    message: 'relatedArticleSlugs 不能包含文章自身',
    path: ['relatedArticleSlugs'],
  })
  // 不能把同一篇相关文章重复列两次（否则页面只渲染出 2 个链接却声称有 3 个）
  .refine((a) => new Set(a.relatedArticleSlugs).size === a.relatedArticleSlugs.length, {
    message: 'relatedArticleSlugs 存在重复项',
    path: ['relatedArticleSlugs'],
  })
  .refine((a) => Date.parse(a.updatedAt) >= Date.parse(a.publishedAt), {
    message: 'updatedAt 不能早于 publishedAt',
    path: ['updatedAt'],
  })

export type Article = z.infer<typeof articleSchema>
export type ArticleInput = z.input<typeof articleSchema>
