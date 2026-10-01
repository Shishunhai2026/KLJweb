/**
 * 护栏类型定义。
 *
 * 设计原则：**风险最高的意图绝不经过大模型**。
 * 急症与固定拒绝话术在「前置护栏」阶段就被拦截并直接返回写死的文本，
 * 后续的检索、生成、后置扫描都不会执行。
 */

export type GuardrailAction =
  /** 放行，继续正常流程 */
  | 'allow'
  /** 急症 / 危机升级：直接返回写死的安全话术，不调用 LLM */
  | 'escalate_emergency'
  /** 命中固定拒绝话术：直接返回写死的文本，不调用 LLM */
  | 'refuse_canonical'
  /** 超出睡眠健康范围：礼貌引导回主题 */
  | 'out_of_scope'

export interface GuardrailDecision {
  action: GuardrailAction
  /** 命中的规则 id，便于测试断言与线上归因 */
  ruleId: string
  /** 人类可读的判定原因，仅用于日志与调试，不展示给用户 */
  reason: string
  /** 需要直接返回给用户的固定话术（action 不为 allow 时必有值） */
  response?: string
  /** 附在回答之后的免责说明 */
  disclaimer?: string
  /** 命中的具体触发词，便于排查误报 */
  matched?: string
}

// ---------------------------------------------------------------------------
// 违禁表述扫描
// ---------------------------------------------------------------------------

export type ClaimViolationKind = 'absolute' | 'contextual' | 'pattern' | 'product-mention'

export interface ClaimViolation {
  /** 规则标识：绝对禁用用 `absolute:<词>`，正则用 pattern 的 id */
  ruleId: string
  kind: ClaimViolationKind
  /** 实际命中的字符串 */
  matched: string
  reason: string
}

export interface ClaimScanResult {
  clean: boolean
  violations: ClaimViolation[]
}

/** 扫描语境。同一个词在不同语境下的合规性不同。 */
export type ClaimScanContext =
  /** AI 生成的回答：最严格，绝对禁用与语境禁用全部生效 */
  | 'ai-output'
  /** 文章的 Quick Answer / 核心结论：额外禁止夹带产品信息 */
  | 'quick-answer'
  /** 产品页正文：语境禁用不生效（产品表述由 claims 字段单独管控） */
  | 'product-body'

// ---------------------------------------------------------------------------
// 后置护栏
// ---------------------------------------------------------------------------

export interface PostGuardrailResult {
  /** allow=原样输出；rewrite_required=必须降级为模板回答 */
  action: 'allow' | 'rewrite_required'
  /** 可能被修正后的文本（如补上核验标记） */
  text: string
  violations: ClaimViolation[]
}
