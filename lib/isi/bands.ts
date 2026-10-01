import { z } from 'zod'

/**
 * ISI（失眠严重程度指数）严重程度分级（需求文档 §6.1）。
 *
 * 分数区间与分级名称是量表的一部分，任何改动都会影响自测结果的解读口径，
 * 因此集中在这里定义，并由单元测试对四个边界逐一断言。
 */

export const ISI_MIN_SCORE = 0
export const ISI_MAX_SCORE = 28

export interface SeverityBandDefinition {
  readonly slug: SeverityBand
  readonly label: string
  /** 结果页的解读文案——描述「睡眠情况」，不做疾病判断 */
  readonly summary: string
  readonly min: number
  readonly max: number
}

export const SEVERITY_BANDS = [
  {
    slug: 'none',
    label: '无临床意义的失眠',
    summary:
      '当前得分处于较低区间。睡眠可能偶有波动，但尚未对日常生活构成明显影响。',
    min: 0,
    max: 7,
  },
  {
    slug: 'subthreshold',
    label: '亚临床失眠',
    summary:
      '当前得分提示存在一些睡眠困扰的迹象，通常还没有达到需要干预的程度，但值得开始关注作息与睡眠习惯。',
    min: 8,
    max: 14,
  },
  {
    slug: 'moderate',
    label: '中度失眠',
    summary:
      '当前得分提示睡眠问题已经比较明显，可能正在影响白天的精力与情绪。建议系统性地调整睡眠习惯，并考虑咨询专业人员。',
    min: 15,
    max: 21,
  },
  {
    slug: 'severe',
    label: '重度失眠',
    summary:
      '当前得分提示睡眠问题较为严重，对白天状态的影响可能已经比较突出。建议尽快寻求专业医疗人员的评估。',
    min: 22,
    max: 28,
  },
] as const

export type SeverityBand = (typeof SEVERITY_BANDS)[number]['slug']

export const severityBandSchema = z.enum(['none', 'subthreshold', 'moderate', 'severe'])

export function getBand(score: number): SeverityBandDefinition {
  const found = SEVERITY_BANDS.find((b) => score >= b.min && score <= b.max)
  if (!found) {
    throw new RangeError(`ISI 分数超出 0–28 的有效范围：${score}`)
  }
  return found
}

export function getBandDefinition(band: SeverityBand): SeverityBandDefinition {
  const found = SEVERITY_BANDS.find((b) => b.slug === band)
  if (!found) throw new Error(`未知的严重程度分级：${band}`)
  return found
}
