import { z } from 'zod'

import { EVIDENCE } from '../evidence'

/**
 * 共享的基础 Schema。
 *
 * 本文件刻意保持「纯结构校验」——不读文件系统、不引外部数据，
 * 因此可以安全地被客户端组件间接引用。
 * 涉及跨文件引用完整性、违禁词扫描等需要读盘的检查，放在 lib/content/lint.ts。
 */

/** 1–6 的字面量联合，校验通过后类型天然是 EvidenceLevel。 */
export const evidenceLevelSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
])

/** URL slug：小写字母、数字与连字符。中文标题的 slug 一律用英文短横线形式。 */
export const slugSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug 只能包含小写字母、数字与单个连字符分隔')

/**
 * ISO 日期，接受 `YYYY-MM-DD` 或完整的 ISO 8601 时间戳。
 * 不使用 z.iso.datetime() 等版本相关 API，保证跨 Zod 版本可移植。
 */
export const isoDateSchema = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?)?$/,
    '日期必须是 YYYY-MM-DD 或完整的 ISO 8601 时间戳',
  )
  .refine((v) => !Number.isNaN(Date.parse(v)), '日期无法被解析')

export const contentStatusSchema = z.enum([
  'draft',
  'in_review',
  'approved',
  'published',
  'archived',
])

/**
 * 资料来源。
 * `evidenceLevel >= 3` 表示资料来自企业自身，此时 `verification` 不得是 `independent`
 * ——这条不变式由 refine 强制，防止有人把企业宣传资料标成独立核验。
 */
export const sourceRefSchema = z
  .object({
    id: z.string().min(1).max(80),
    title: z.string().min(1).max(300),
    publisher: z.string().max(200).optional(),
    authors: z.array(z.string().max(100)).optional(),
    year: z.number().int().min(1800).max(2200).optional(),
    url: z.string().max(2000).optional(),
    /** 站内静态资源路径，如 /evidence/patent-01.jpg */
    asset: z.string().max(500).optional(),
    evidenceLevel: evidenceLevelSchema,
    verification: z.enum(['independent', 'company-only', 'pending']),
    /** 核验状态说明，如「原始报告为扫描件，无可机读文本，待独立核验」 */
    verificationNote: z.string().max(500).optional(),
    /** 资料自身注明的使用限制，如「报告内容不得用于商业广告」 */
    usageRestriction: z.string().max(500).optional(),
  })
  .refine(
    (s) => !(s.evidenceLevel >= 3 && s.verification === 'independent'),
    '企业来源的资料（Level 3–6）不能标记为独立核验',
  )
  .refine(
    (s) => EVIDENCE[s.evidenceLevel].companyMarker === false || s.verification !== 'independent',
    '该证据等级必须标注核验状态',
  )

/** 关键事实。每一条都必须能追溯到 sources 中的某个 sourceId。 */
export const keyFactSchema = z.object({
  statement: z.string().min(4).max(300),
  /** 数值型结论，如 '93.3%'，便于结构化展示 */
  value: z.string().max(60).optional(),
  sourceId: z.string().min(1).max(80),
  evidenceLevel: evidenceLevelSchema,
})

/**
 * FAQ 条目。
 * 答案长度定在 20–300 字：短于 20 字无法被 AI 搜索当作可用片段引用，
 * 长于 300 字则难以被完整摘录。理想区间是 40–120 字。
 */
export const faqItemSchema = z.object({
  question: z.string().min(4).max(80),
  answer: z.string().min(20).max(300),
})

export const intentSchema = z.enum([
  'informational',
  'problem',
  'commercial',
  'navigational',
])

export const robotsDirectiveSchema = z.enum([
  'index,follow',
  'noindex,follow',
  'noindex,nofollow',
])

/**
 * SEO 字段。
 * 需求文档 §38 要求每个页面都必须拥有 title / description / canonical / robots 等，
 * 因此 description 与 keywords 设为必填而非可选。
 */
export const seoSchema = z.object({
  /** 覆盖 <title>；不填则由 title 派生。中文标题建议不超过 30 字。 */
  title: z.string().min(4).max(60).optional(),
  description: z.string().min(20).max(200),
  keywords: z.array(z.string().min(1).max(40)).min(1),
  /** 本文主打的目标查询词，一个页面只应瞄准一个 */
  targetQuery: z.string().max(80).optional(),
  intent: intentSchema,
  canonicalPath: z.string().max(500).optional(),
  robots: robotsDirectiveSchema.default('index,follow'),
})

export type SourceRef = z.infer<typeof sourceRefSchema>
export type KeyFact = z.infer<typeof keyFactSchema>
export type FaqItem = z.infer<typeof faqItemSchema>
export type SeoFields = z.infer<typeof seoSchema>
export type ContentStatus = z.infer<typeof contentStatusSchema>
export type RobotsDirective = z.infer<typeof robotsDirectiveSchema>
export type Intent = z.infer<typeof intentSchema>
