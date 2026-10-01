import { z } from 'zod'

import { severityBandSchema } from '../../isi/bands'
import { slugSchema } from './common'

/**
 * 销售线索（需求文档 §34）。
 *
 * 手机号与微信号属于《个人信息保护法》下的个人信息：
 * - 必须同时提交隐私政策同意（consent 为必填对象，且 privacyAccepted 必须是字面量 true）
 * - 绝不存储原始 IP，只存加盐哈希
 * - 用户名、手机号、微信号不得进入分析事件与服务端日志
 */

export const leadSourceSchema = z.enum([
  'google',
  'baidu',
  'xiaohongshu',
  'douyin',
  'wechat',
  'direct',
  'ai_search',
  'other',
])

export const consultationStatusSchema = z.enum([
  'new',
  'contacted',
  'qualified',
  'won',
  'lost',
  'invalid',
])

/** 中国大陆手机号 */
const CN_PHONE_REGEX = /^1[3-9]\d{9}$/
/** 微信号：字母开头，可含字母、数字、下划线、连字符 */
const WECHAT_REGEX = /^[a-zA-Z][a-zA-Z0-9_-]{5,19}$/

/** 客户端提交的表单数据。 */
export const leadSubmissionSchema = z
  .object({
    nickname: z.string().max(40).optional(),
    phone: z.string().max(20).optional(),
    wechat: z.string().max(40).optional(),

    source: leadSourceSchema,
    landingPage: z.string().min(1).max(500),
    keyword: z.string().max(100).optional(),

    sleepProblem: slugSchema.optional(),
    testScore: z.number().int().min(0).max(28).optional(),
    testSeverity: severityBandSchema.optional(),
    aiConversationId: z.string().max(64).optional(),
    productInterest: z.array(z.string().max(60)).max(20).optional(),

    consent: z.object({
      privacyAccepted: z.literal(true),
      policyVersion: z.string().min(1).max(40),
    }),

    meta: z
      .object({
        referrer: z.string().max(2000).optional(),
        utm: z.record(z.string().max(40), z.string().max(200)).optional(),
      })
      .optional(),
  })
  // 至少留下一种联系方式，否则线索无法跟进
  .refine((l) => Boolean(l.phone) || Boolean(l.wechat), {
    message: '请至少填写手机号或微信号中的一项',
    path: ['phone'],
  })
  .refine((l) => !l.phone || CN_PHONE_REGEX.test(l.phone), {
    message: '请输入有效的中国大陆手机号',
    path: ['phone'],
  })
  .refine((l) => !l.wechat || l.wechat.length >= 6, {
    message: '微信号至少 6 个字符',
    path: ['wechat'],
  })
  .refine((l) => !l.wechat || WECHAT_REGEX.test(l.wechat), {
    message: '微信号格式不正确（以字母开头，可由字母、数字、下划线组成）',
    path: ['wechat'],
  })
  // 分数与分级必须同时提供，避免出现「有分数但没有解读口径」的脏数据
  .refine((l) => (l.testScore === undefined) === (l.testSeverity === undefined), {
    message: 'testScore 与 testSeverity 必须同时提供或同时省略',
    path: ['testSeverity'],
  })

/** 服务端落库的完整记录。 */
export const leadRecordSchema = leadSubmissionSchema.safeExtend({
  id: z.string().min(1).max(64),
  consultationStatus: consultationStatusSchema,
  consent: z.object({
    privacyAccepted: z.literal(true),
    acceptedAt: z.string().min(1),
    policyVersion: z.string().min(1).max(40),
  }),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  /** 加盐 SHA-256，绝不存原始 IP */
  ipHash: z.string().max(128).optional(),
  meta: z
    .object({
      referrer: z.string().max(2000).optional(),
      utm: z.record(z.string().max(40), z.string().max(200)).optional(),
      userAgent: z.string().max(500).optional(),
    })
    .optional(),
})

export type LeadSubmission = z.infer<typeof leadSubmissionSchema>
export type LeadRecord = z.infer<typeof leadRecordSchema>
export type LeadSource = z.infer<typeof leadSourceSchema>
export type ConsultationStatus = z.infer<typeof consultationStatusSchema>
