import { compileRegex, getForbiddenClaimsRules } from './rules'
import type {
  ClaimScanContext,
  ClaimScanResult,
  ClaimViolation,
  ClaimViolationKind,
} from './types'

/**
 * 违禁表述扫描。
 *
 * 这是「不把企业宣传资料转换成医学结论」这条要求的最后一道机械保障：
 * 无论大模型被怎么诱导，生成的文本都要再过一遍这里。
 */

function collect(
  text: string,
  rules: readonly { term: string; reason: string }[],
  kind: ClaimViolationKind,
  prefix: string,
): ClaimViolation[] {
  const found: ClaimViolation[] = []
  for (const rule of rules) {
    if (text.includes(rule.term)) {
      found.push({
        ruleId: `${prefix}:${rule.term}`,
        kind,
        matched: rule.term,
        reason: rule.reason,
      })
    }
  }
  return found
}

/**
 * 扫描文本中的违禁表述。
 *
 * @param context 决定规则的严格程度：
 *  - `ai-output`：AI 回答，绝对禁用 + 语境禁用 + 正则 全部生效
 *  - `quick-answer`：文章 Quick Answer，在上面基础上额外禁止夹带产品信息
 *  - `product-body`：产品页正文，只保留绝对禁用（产品表述由 claims 字段单独管控）
 */
export function scanForbiddenClaims(text: string, context: ClaimScanContext): ClaimScanResult {
  const rules = getForbiddenClaimsRules()
  const violations: ClaimViolation[] = []

  // 绝对禁用：任何语境都不放行
  violations.push(...collect(text, rules.absoluteForbidden, 'absolute', 'absolute'))

  if (context !== 'product-body') {
    violations.push(...collect(text, rules.contextualForbidden, 'contextual', 'contextual'))

    for (const pattern of rules.patterns) {
      const regex = compileRegex(pattern.regex)
      if (!regex) continue
      const match = regex.exec(text)
      if (match) {
        violations.push({
          ruleId: `pattern:${pattern.id}`,
          kind: 'pattern',
          matched: match[0],
          reason: pattern.reason,
        })
      }
    }
  }

  // Quick Answer 不得夹带产品与促销信息（需求文档 §29）
  if (context === 'quick-answer') {
    for (const mention of rules.productMentions) {
      if (text.includes(mention)) {
        violations.push({
          ruleId: `product-mention:${mention}`,
          kind: 'product-mention',
          matched: mention,
          reason: 'Quick Answer 必须保持中立，不得出现产品名称或促销信息',
        })
      }
    }
  }

  return { clean: violations.length === 0, violations }
}

/** 文本中是否出现了产品名称或促销用语。 */
export function containsProductMention(text: string): boolean {
  const { productMentions } = getForbiddenClaimsRules()
  return productMentions.some((mention) => text.includes(mention))
}
