import { readFileSync } from 'node:fs'
import path from 'node:path'

import { z } from 'zod'
import { parse as parseYaml } from 'yaml'

import { sleepProblemCategorySchema } from '../../content/taxonomy'

/**
 * 护栏规则的加载与校验。
 *
 * 规则以 YAML 存放（content/_guardrails/），在模块初始化时读取一次并缓存。
 * 任何一条规则格式不合法都会在启动时抛错——护栏静默失效比崩溃危险得多。
 *
 * ⚠️ 本模块读文件系统，只能在 Node 运行时使用（API Route / 构建脚本），
 *    不要从客户端组件引用。
 */

const GUARDRAILS_DIR = path.join(process.cwd(), 'content', '_guardrails')

// ---------------------------------------------------------------------------
// 各文件的 Schema
// ---------------------------------------------------------------------------

const termRuleSchema = z.object({
  term: z.string().min(1),
  reason: z.string().min(1),
})

const forbiddenClaimsFileSchema = z.object({
  version: z.number().int().positive(),
  updatedAt: z.string().min(1),
  absoluteForbidden: z.array(termRuleSchema).min(1),
  contextualForbidden: z.array(termRuleSchema).min(1),
  patterns: z
    .array(
      z.object({
        id: z.string().min(1),
        regex: z.string().min(1),
        reason: z.string().min(1),
      }),
    )
    .min(1),
  productMentions: z.array(z.string().min(1)).min(1),
})

const emergencyFileSchema = z.object({
  version: z.number().int().positive(),
  updatedAt: z.string().min(1),
  triggers: z
    .array(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1),
        action: z.literal('escalate_emergency'),
        terms: z.array(z.string().min(2)).min(1),
        response: z.string().min(20),
      }),
    )
    .min(1),
  escalationFooter: z.string().min(10),
})

const refusalFileSchema = z.object({
  version: z.number().int().positive(),
  updatedAt: z.string().min(1),
  refusals: z
    .array(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1),
        priority: z.number().int(),
        patterns: z.array(z.string().min(1)).min(1),
        response: z.string().min(20),
        disclaimer: z.string().min(4),
      }),
    )
    .min(1),
})

const intentGroupSchema = z.object({
  label: z.string().min(1),
  patterns: z.array(z.string().min(1)).min(1),
})

const intentFileSchema = z.object({
  version: z.number().int().positive(),
  updatedAt: z.string().min(1),
  problemPatterns: z
    .array(
      z.object({
        category: sleepProblemCategorySchema,
        label: z.string().min(1),
        patterns: z.array(z.string().min(1)).min(1),
      }),
    )
    .min(1),
  wantsSelfTest: intentGroupSchema,
  asksProductInfo: intentGroupSchema,
  wantsProductRecommendation: intentGroupSchema,
  durationPatterns: intentGroupSchema,
  outOfScope: intentGroupSchema,
})

// ---------------------------------------------------------------------------
// 加载
// ---------------------------------------------------------------------------

export type ForbiddenClaimsRules = z.infer<typeof forbiddenClaimsFileSchema>
export type EmergencyRules = z.infer<typeof emergencyFileSchema>
export type RefusalRules = z.infer<typeof refusalFileSchema>
export type IntentRules = z.infer<typeof intentFileSchema>

function loadYaml<T>(fileName: string, schema: z.ZodType<T>): T {
  const fullPath = path.join(GUARDRAILS_DIR, fileName)

  let raw: string
  try {
    raw = readFileSync(fullPath, 'utf8')
  } catch (cause) {
    throw new Error(
      `无法读取护栏规则文件：${fullPath}\n` +
        `护栏规则缺失时 AI 助手必须拒绝启动，而不是在无保护状态下运行。`,
      { cause },
    )
  }

  const parsed: unknown = parseYaml(raw)

  const result = schema.safeParse(parsed)
  if (!result.success) {
    throw new Error(
      `护栏规则文件格式不合法：${fileName}\n${JSON.stringify(result.error.issues, null, 2)}`,
    )
  }
  return result.data
}

let forbiddenClaimsCache: ForbiddenClaimsRules | null = null
let emergencyCache: EmergencyRules | null = null
let refusalCache: RefusalRules | null = null
let intentCache: IntentRules | null = null

export function getForbiddenClaimsRules(): ForbiddenClaimsRules {
  forbiddenClaimsCache ??= loadYaml('forbidden-claims.yaml', forbiddenClaimsFileSchema)
  return forbiddenClaimsCache
}

export function getEmergencyRules(): EmergencyRules {
  emergencyCache ??= loadYaml('emergency-terms.yaml', emergencyFileSchema)
  return emergencyCache
}

export function getRefusalRules(): RefusalRules {
  refusalCache ??= loadYaml('canonical-refusals.yaml', refusalFileSchema)
  return refusalCache
}

export function getIntentRules(): IntentRules {
  intentCache ??= loadYaml('intent-patterns.yaml', intentFileSchema)
  return intentCache
}

/**
 * 编译并缓存正则。
 * 规则是我们自己维护的，但仍加 try/catch——一条写错的正则不应该让整个助手不可用。
 */
const regexCache = new Map<string, RegExp | null>()

export function compileRegex(source: string): RegExp | null {
  const cached = regexCache.get(source)
  if (cached !== undefined) return cached

  let compiled: RegExp | null = null
  try {
    compiled = new RegExp(source, 'i')
  } catch {
    console.warn(`[guardrails] 正则编译失败，该条规则被跳过：${source}`)
    compiled = null
  }
  regexCache.set(source, compiled)
  return compiled
}

/** 仅供测试使用：清空所有缓存。 */
export function __resetRuleCaches(): void {
  forbiddenClaimsCache = null
  emergencyCache = null
  refusalCache = null
  intentCache = null
  regexCache.clear()
}
