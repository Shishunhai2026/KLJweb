import { compileRegex, getEmergencyRules, getRefusalRules, getIntentRules } from './rules'
import type { GuardrailDecision } from './types'

/**
 * 前置护栏：用户消息进入检索与大模型之前的第一道闸门。
 *
 * 判定顺序不可调换：
 *   1. 急症 / 危机  —— 必须最先判定，任何其他规则都不应抢在它前面
 *   2. 固定拒绝话术 —— 按 priority 从高到低匹配
 *   3. 超出范围     —— 礼貌引导回睡眠话题
 *   4. 放行
 */

function firstMatchingTerm(text: string, terms: readonly string[]): string | null {
  for (const term of terms) {
    if (text.includes(term)) return term
  }
  return null
}

/** 急症 / 危机识别。命中即返回写死的话术，绝不交给大模型处理。 */
export function detectEmergency(message: string): GuardrailDecision | null {
  const { triggers, escalationFooter } = getEmergencyRules()

  for (const trigger of triggers) {
    const matched = firstMatchingTerm(message, trigger.terms)
    if (matched) {
      return {
        action: 'escalate_emergency',
        ruleId: `emergency:${trigger.id}`,
        reason: trigger.label,
        response: `${trigger.response.trim()}\n\n${escalationFooter.trim()}`,
        matched,
      }
    }
  }
  return null
}

/** 固定拒绝话术匹配。 */
export function detectCanonicalRefusal(message: string): GuardrailDecision | null {
  const { refusals } = getRefusalRules()

  const ordered = [...refusals].sort((a, b) => b.priority - a.priority)

  for (const refusal of ordered) {
    for (const source of refusal.patterns) {
      const regex = compileRegex(source)
      if (!regex) continue
      const match = regex.exec(message)
      if (match) {
        return {
          action: 'refuse_canonical',
          ruleId: `refusal:${refusal.id}`,
          reason: refusal.label,
          response: refusal.response.trim(),
          disclaimer: refusal.disclaimer,
          matched: match[0],
        }
      }
    }
  }
  return null
}

/** 是否明显超出睡眠健康范围。 */
export function detectOutOfScope(message: string): GuardrailDecision | null {
  const { outOfScope } = getIntentRules()

  for (const source of outOfScope.patterns) {
    const regex = compileRegex(source)
    if (!regex) continue
    const match = regex.exec(message)
    if (match) {
      return {
        action: 'out_of_scope',
        ruleId: 'scope:out-of-scope',
        reason: outOfScope.label,
        response:
          '我主要负责睡眠健康方面的问题，这个问题可能帮不上忙。\n\n' +
          '如果您有睡眠方面的困扰——比如入睡困难、半夜容易醒、早醒或者睡得不沉，' +
          '可以告诉我具体情况，我来帮您梳理。',
        matched: match[0],
      }
    }
  }
  return null
}

/**
 * 执行完整的前置护栏判定。
 *
 * ⚠️ 只有返回 `allow` 时，调用方才可以继续走检索与大模型流程。
 */
export function evaluatePreGuardrails(message: string): GuardrailDecision {
  const trimmed = message.trim()

  if (trimmed.length === 0) {
    return {
      action: 'out_of_scope',
      ruleId: 'scope:empty',
      reason: '空消息',
      response: '请描述一下您遇到的睡眠情况，例如「躺下很久睡不着」或「半夜总是醒」。',
    }
  }

  return (
    detectEmergency(trimmed) ??
    detectCanonicalRefusal(trimmed) ??
    detectOutOfScope(trimmed) ?? {
      action: 'allow',
      ruleId: 'allow',
      reason: '未命中任何限制规则',
    }
  )
}
