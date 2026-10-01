import { z } from 'zod'

import { kbCategorySchema } from '../taxonomy'
import {
  contentStatusSchema,
  evidenceLevelSchema,
  isoDateSchema,
  slugSchema,
  sourceRefSchema,
} from './common'

/**
 * 结构化睡眠问答（需求文档 §19 knowledge_base）。
 *
 * 每条以「问题 + 精简回答 + 展开说明」的形式组织。
 * `shortAnswer` 必须自带完整语义、脱离上下文即可读懂——
 * 它既用于页面上的一句话回答，也是 AI 搜索摘要最容易引用的部分。
 */
export const knowledgeBaseEntrySchema = z.object({
  id: z.string().min(1).max(80),
  /** 规范问法 */
  question: z.string().min(4).max(80),
  /**
   * 口语化同义问法。检索权重最高——用户不会用规范术语提问，
   * 「凌晨三点醒」「睡得不沉」这类说法必须能命中。
   */
  questionVariants: z.array(z.string().min(2).max(80)).min(1),
  /** 精简回答，无 LLM 时直接返回给用户 */
  shortAnswer: z.string().min(10).max(120),
  /** 展开说明 */
  detailedAnswer: z.string().min(30).max(2000),

  category: kbCategorySchema,
  keywords: z.array(z.string().min(1).max(30)).min(1),

  source: sourceRefSchema,
  evidenceLevel: evidenceLevelSchema,

  relatedArticleSlugs: z.array(slugSchema).default([]),
  relatedProductSlug: slugSchema.optional(),

  /** 针对本条目的医学提示，会附加在回答之后 */
  medicalWarning: z.string().max(500).optional(),
  /** 命中这些短语时强制升级为「建议就医」，绕过大模型 */
  redFlags: z.array(z.string().min(2).max(40)).default([]),
  /** 本条目额外禁止出现的措辞，会与全局禁语表合并 */
  doNotSay: z.array(z.string().min(2).max(40)).default([]),

  lastReviewed: isoDateSchema,
  status: contentStatusSchema,
})

export type KnowledgeBaseEntry = z.infer<typeof knowledgeBaseEntrySchema>
