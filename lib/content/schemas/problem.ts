import { z } from 'zod'

import { sleepProblemCategorySchema } from '../taxonomy'
import {
  contentStatusSchema,
  faqItemSchema,
  isoDateSchema,
  seoSchema,
  slugSchema,
  sourceRefSchema,
} from './common'

/**
 * 睡眠问题专题（需求文档 §7 sleep_problems）。
 *
 * 与需求文档的一处有意偏离：文档字段名为 `possible_factors`，
 * 这里命名为 `possibleFactors`，且 UI 一律渲染为「可能相关因素」，
 * 绝不出现「原因 / 病因」字样。
 * 理由：「原因」断言因果关系，对一个特殊膳食产品而言属于疾病宣称风险。
 */
export const sleepProblemSchema = z.object({
  id: z.string().min(1).max(80),
  slug: slugSchema,
  title: z.string().min(2).max(40),
  category: sleepProblemCategorySchema,

  /** 典型表现，用户自查用 */
  symptoms: z.array(z.string().min(4).max(200)).min(2),
  /** 可能相关因素——注意不是「病因」 */
  possibleFactors: z.array(z.string().min(4).max(200)).min(2),
  /** 相关的睡眠基础知识说明 */
  sleepKnowledge: z.string().min(50).max(2000),
  /** 可以尝试的改善方法 */
  improvementMethods: z.array(z.string().min(4).max(200)).min(2),

  faq: z.array(faqItemSchema).min(5),

  relatedArticleSlugs: z.array(slugSchema).default([]),
  relatedProductSlugs: z.array(slugSchema).default([]),

  seo: seoSchema,
  sources: z.array(sourceRefSchema).default([]),

  status: contentStatusSchema,
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
  order: z.number().int().min(0),
})

export type SleepProblem = z.infer<typeof sleepProblemSchema>
