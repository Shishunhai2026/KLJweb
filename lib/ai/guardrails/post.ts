import { COMPANY_SUPPLIED_MARKER, requiresCompanyMarker, type EvidenceLevel } from '../../content/evidence'
import { scanForbiddenClaims } from './claims'
import type { PostGuardrailResult } from './types'

/**
 * 后置护栏：对「已经生成出来」的文本做机械校验。
 *
 * 前置护栏靠判断意图，后置护栏靠扫描结果——两者互补。
 * 提示词写得多好都不能替代这一步：模型总有可能被诱导绕过系统提示。
 */

/**
 * 补齐证据标记。
 *
 * 只要回答引用了 Level 3 及以上的资料，正文就必须出现「企业提供资料，待独立核验」。
 * 即使模型在提示词里被要求写、但实际漏了，这里也会补上。
 */
export function enforceEvidenceMarkers(text: string, levels: readonly EvidenceLevel[]): string {
  const needsMarker = levels.some((level) => requiresCompanyMarker(level))
  if (!needsMarker) return text
  if (text.includes(COMPANY_SUPPLIED_MARKER)) return text
  return `${text}\n\n> ${COMPANY_SUPPLIED_MARKER}`
}

/**
 * 对生成文本执行完整后置校验。
 *
 * @param citedLevels 本次回答实际引用的资料等级，用于判定是否需要补核验标记
 */
export function evaluatePostGuardrails(
  text: string,
  options: { citedLevels?: readonly EvidenceLevel[] } = {},
): PostGuardrailResult {
  const scan = scanForbiddenClaims(text, 'ai-output')
  const marked = enforceEvidenceMarkers(text, options.citedLevels ?? [])

  return {
    // 出现违禁表述时，调用方必须丢弃这段生成内容并降级为知识库模板回答。
    // 不做「自动清洗违禁词」——删词会让句子语义残缺，模板回答才是可预期的降级路径。
    action: scan.clean ? 'allow' : 'rewrite_required',
    text: marked,
    violations: scan.violations,
  }
}
