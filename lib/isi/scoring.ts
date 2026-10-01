import { ISI_MAX_SCORE, ISI_MIN_SCORE, getBand, type SeverityBand } from './bands'
import { ISI_ITEM_IDS, type IsiAnswer, type IsiItemId } from './items'

/**
 * ISI 计分。
 *
 * 刻意保持纯函数、无副作用、不读文件——这是全站最需要 100% 分支覆盖的模块之一：
 * 计分错了，用户拿到的睡眠建议就是错的。
 */

export type IsiAnswers = Record<IsiItemId, IsiAnswer>

export interface IsiScore {
  answers: IsiAnswers
  total: number
  band: SeverityBand
}

export const ISI_ITEM_COUNT = ISI_ITEM_IDS.length

/** 单个答案是否合法（0–4 的整数）。 */
export function isValidAnswer(value: unknown): value is IsiAnswer {
  return (
    typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 4
  )
}

/**
 * 校验作答是否完整合法。
 * 返回全部问题描述，便于表单一次性提示所有错误，而不是逐个报错。
 */
export function validateAnswers(
  answers: Partial<Record<IsiItemId, unknown>>,
): { valid: true; answers: IsiAnswers } | { valid: false; errors: string[] } {
  const errors: string[] = []
  const normalized = {} as IsiAnswers

  for (const id of ISI_ITEM_IDS) {
    const value = answers[id]
    if (value === undefined || value === null) {
      errors.push(`第 ${ISI_ITEM_IDS.indexOf(id) + 1} 题尚未作答`)
      continue
    }
    if (!isValidAnswer(value)) {
      errors.push(`第 ${ISI_ITEM_IDS.indexOf(id) + 1} 题的答案只能是 0 到 4 之间的整数`)
      continue
    }
    normalized[id] = value
  }

  if (errors.length > 0) return { valid: false, errors }
  return { valid: true, answers: normalized }
}

/**
 * 计算总分。
 * 作答不完整或越界时抛错，而不是静默返回一个偏低的分数——
 * 静默出错会让用户得到一个「看起来正常」的假结果。
 */
export function calculateTotal(answers: IsiAnswers): number {
  let total = 0
  for (const id of ISI_ITEM_IDS) {
    const value = answers[id]
    if (!isValidAnswer(value)) {
      throw new RangeError(`ISI 第 ${ISI_ITEM_IDS.indexOf(id) + 1} 题的答案非法：${String(value)}`)
    }
    total += value
  }
  return total
}

/** 依据总分判定严重程度分级。 */
export function scoreToBand(total: number): SeverityBand {
  if (!Number.isInteger(total) || total < ISI_MIN_SCORE || total > ISI_MAX_SCORE) {
    throw new RangeError(`ISI 总分超出 ${ISI_MIN_SCORE}–${ISI_MAX_SCORE} 的有效范围：${total}`)
  }
  return getBand(total).slug
}

/** 一站式计分：作答 → 总分 → 分级。 */
export function scoreIsi(answers: IsiAnswers): IsiScore {
  const total = calculateTotal(answers)
  return { answers, total, band: scoreToBand(total) }
}

/**
 * 逐题得分明细，用于结果页展示「哪些方面比较突出」。
 * 不参与判定，仅供用户理解自己的分数构成。
 */
export function itemBreakdown(answers: IsiAnswers): { id: IsiItemId; value: IsiAnswer }[] {
  return ISI_ITEM_IDS.map((id) => ({ id, value: answers[id] }))
}
