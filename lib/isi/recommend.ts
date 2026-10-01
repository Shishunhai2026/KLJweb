import type { SleepProblemCategory } from '../content/taxonomy'
import { getBandDefinition } from './bands'
import type { IsiAnswers, IsiScore } from './scoring'

/**
 * 自测结果的组织逻辑。
 *
 * 这里承载需求文档反复强调的转化顺序：
 *   当前睡眠情况 → 可能存在的主要问题 → 推荐阅读 → 改善建议 → AI 助手 → 【最后才是】产品
 *
 * `RESULT_SECTION_ORDER` 是这份顺序的唯一定义，
 * `sections` 数组的顺序由单元测试断言，使「产品不能最先出现」成为可回归的契约，
 * 而不是一句设计意图。
 */

export const RESULT_SECTION_ORDER = [
  'summary',
  'severity',
  'likelyProblems',
  'articles',
  'advice',
  'productTeaser',
] as const

export type ResultSection = (typeof RESULT_SECTION_ORDER)[number]

/** 条目得分达到该值（中度）才认为该维度「比较突出」。 */
const NOTABLE_THRESHOLD = 2

/**
 * 根据作答推断可能存在的主要问题类型。
 *
 * 注意用词：这是「可能相关」，不是诊断。
 * 结果页展示时必须配合免责声明，且不得表述为「您患有 X」。
 */
export function inferLikelyProblems(answers: IsiAnswers): SleepProblemCategory[] {
  const candidates: { category: SleepProblemCategory; score: number }[] = []

  if (answers.isi_1 >= NOTABLE_THRESHOLD) {
    candidates.push({ category: 'difficulty-initiating', score: answers.isi_1 })
  }
  if (answers.isi_2 >= NOTABLE_THRESHOLD) {
    candidates.push({ category: 'night-awakening', score: answers.isi_2 })
  }
  if (answers.isi_3 >= NOTABLE_THRESHOLD) {
    candidates.push({ category: 'early-awakening', score: answers.isi_3 })
  }
  if (answers.isi_5 >= NOTABLE_THRESHOLD) {
    candidates.push({ category: 'daytime-fatigue', score: answers.isi_5 })
  }

  // 各条目都不突出，但总体分数偏高 → 归为整体睡眠质量下降
  if (candidates.length === 0) {
    const total = Object.values(answers).reduce<number>((sum, v) => sum + v, 0)
    if (total >= 8) {
      return ['poor-sleep-quality']
    }
    return []
  }

  return candidates
    .sort((a, b) => b.score - a.score)
    .map((c) => c.category)
}

/** 分档对应的通用改善建议。全部为睡眠习惯层面的内容，不含任何产品信息。 */
const ADVICE_BY_BAND: Record<string, readonly string[]> = {
  none: [
    '保持相对固定的起床时间，包括周末。',
    '睡前 1 小时减少屏幕使用，让大脑逐步进入放松状态。',
    '如果睡眠偶尔波动，不必过度关注，通常几天内会自行恢复。',
  ],
  subthreshold: [
    '固定每天的起床时间，这比固定入睡时间更容易做到，也更有效。',
    '把床主要留给睡眠——不要在床上长时间工作或刷手机。',
    '下午之后避免咖啡、浓茶等含咖啡因的饮品。',
    '连续记录 1–2 周的睡眠日志，有助于发现规律。',
  ],
  moderate: [
    '固定起床时间，白天尽量接触自然光，尤其是早晨。',
    '如果躺下 20 分钟仍无法入睡，可以起身做些安静的事，有困意再回到床上。',
    '减少睡前的情绪与信息刺激，把操心的事安排在白天处理。',
    '如果调整一段时间后仍无改善，建议到睡眠门诊或相关科室做进一步评估。',
  ],
  severe: [
    '建议尽快到医院的睡眠门诊、神经内科或精神心理科就诊，由医生做系统评估。',
    '就诊前可以记录一段时间的睡眠日志，把入睡时间、醒来次数、白天状态记下来，供医生参考。',
    '在医生评估之前，不要自行使用或停用任何助眠药物。',
    '保持固定的起床时间，白天适度活动，避免长时间卧床。',
  ],
}

export interface IsiResultView {
  score: IsiScore
  bandLabel: string
  bandSummary: string
  /** 实际要渲染的区块，顺序即契约 */
  sections: ResultSection[]
  likelyProblems: SleepProblemCategory[]
  advice: string[]
  /** 分数处于最低档时不展示产品入口 */
  showProductTeaser: boolean
}

export function buildIsiResult(score: IsiScore): IsiResultView {
  const band = getBandDefinition(score.band)
  const likelyProblems = inferLikelyProblems(score.answers)
  const advice = [...(ADVICE_BY_BAND[score.band] ?? [])]

  // 最低档（0–7 分）不出现产品入口——用户此时并没有需要解决的睡眠问题
  const showProductTeaser = score.band !== 'none'

  const sections: ResultSection[] = RESULT_SECTION_ORDER.filter(
    (section) => section !== 'productTeaser' || showProductTeaser,
  )

  return {
    score,
    bandLabel: band.label,
    bandSummary: band.summary,
    sections,
    likelyProblems,
    advice,
    showProductTeaser,
  }
}
