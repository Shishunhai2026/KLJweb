/**
 * 证据等级（需求文档 §14）
 *
 * 全站唯一真源：任何资料「可不可以当作事实陈述」「是否必须渲染核验标记」，
 * 都由这张表决定，不允许在组件里另外硬编码判断。
 */

export const EVIDENCE_LEVELS = [1, 2, 3, 4, 5, 6] as const

export type EvidenceLevel = (typeof EVIDENCE_LEVELS)[number]

export interface EvidenceDefinition {
  readonly level: EvidenceLevel
  /** 展示用全称 */
  readonly label: string
  /** 徽章缩写 */
  readonly short: string
  /**
   * 是否属于「独立于企业」的资料。
   * true 时才可以作为已确立的事实陈述（如教科书、公开发表的同行评议研究）。
   */
  readonly independent: boolean
  /** 是否必须渲染「企业提供资料，待独立核验」标记 */
  readonly companyMarker: boolean
  /** 面向运营的说明，会展示在内容编辑规范里 */
  readonly description: string
}

export const EVIDENCE: Record<EvidenceLevel, EvidenceDefinition> = {
  1: {
    level: 1,
    label: '公开医学 / 科研机构资料',
    short: 'L1',
    independent: true,
    companyMarker: false,
    description: '教材、指南、权威机构公开资料。可作为事实陈述。',
  },
  2: {
    level: 2,
    label: '公开发表研究',
    short: 'L2',
    independent: true,
    companyMarker: false,
    description: '同行评议期刊上的公开发表研究。可作为事实陈述，但须标明研究局限。',
  },
  3: {
    level: 3,
    label: '产品相关研究',
    short: 'L3',
    independent: false,
    companyMarker: true,
    description: '与本产品直接相关的研究。必须标注「企业提供资料，待独立核验」。',
  },
  4: {
    level: 4,
    label: '企业检测报告',
    short: 'L4',
    independent: false,
    companyMarker: true,
    description: '企业的自检或委托检测报告。必须标注核验状态与报告的使用限制。',
  },
  5: {
    level: 5,
    label: '企业宣传资料',
    short: 'L5',
    independent: false,
    companyMarker: true,
    description: '企业自行编制的宣传材料。不得作为医学结论引用。',
  },
  6: {
    level: 6,
    label: '用户体验',
    short: 'L6',
    independent: false,
    companyMarker: true,
    description: '个人使用体验。存在个体差异，不构成产品功效保证。',
  },
}

/** 企业提供资料的统一核验标记。所有 L3 及以上内容必须原样渲染这句。 */
export const COMPANY_SUPPLIED_MARKER = '企业提供资料，待独立核验'

/** 用户体验资料的统一免责声明。禁止把个别体验包装成医学结论。 */
export const TESTIMONIAL_DISCLAIMER =
  '用户体验存在个体差异，仅代表个人感受，不构成产品功效保证。'

/** 睡眠自测的统一免责声明（需求文档 §6.1 原文）。 */
export const SELF_TEST_DISCLAIMER =
  '本测试用于睡眠情况筛查和健康教育，不能替代医生诊断。'

/** 该等级的资料是否可以当作「已确立的事实」来陈述。 */
export function mayAssertAsFact(level: EvidenceLevel): boolean {
  return EVIDENCE[level].independent
}

/** 该等级的资料是否必须渲染「企业提供资料，待独立核验」标记。 */
export function requiresCompanyMarker(level: EvidenceLevel): boolean {
  return EVIDENCE[level].companyMarker
}

/** 一组资料中最高的证据强度（数值最小 = 证据最强）。用于页面级徽章。 */
export function strongestLevel(levels: readonly EvidenceLevel[]): EvidenceLevel | null {
  if (levels.length === 0) return null
  return levels.reduce<EvidenceLevel>((best, l) => (l < best ? l : best), 6)
}
