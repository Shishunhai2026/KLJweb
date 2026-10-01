/**
 * ISI 失眠严重程度指数（Insomnia Severity Index）量表题目。
 *
 * 7 个条目，每条 0–4 分，总分 0–28。
 * 量表为公开的临床筛查工具，此处采用其中文表述。
 *
 * ⚠️ 第 4 题的选项锚点与其他题不同（满意度越好分数越低），
 *    因此每道题必须携带自己的 options，不能共用一套。
 */

export type IsiItemId =
  | 'isi_1'
  | 'isi_2'
  | 'isi_3'
  | 'isi_4'
  | 'isi_5'
  | 'isi_6'
  | 'isi_7'

export type IsiAnswer = 0 | 1 | 2 | 3 | 4

export interface IsiOption {
  readonly value: IsiAnswer
  readonly label: string
}

export interface IsiItem {
  readonly id: IsiItemId
  readonly order: number
  readonly question: string
  /** 补充说明，帮助用户理解题意 */
  readonly hint?: string
  readonly options: readonly IsiOption[]
}

/** 严重程度锚点：分数越高问题越重。用于第 1、2、3、5、6、7 题。 */
const SEVERITY_OPTIONS: readonly IsiOption[] = [
  { value: 0, label: '无' },
  { value: 1, label: '轻度' },
  { value: 2, label: '中度' },
  { value: 3, label: '重度' },
  { value: 4, label: '极重度' },
]

/** 满意程度锚点：分数越高越不满意。仅用于第 4 题。 */
const SATISFACTION_OPTIONS: readonly IsiOption[] = [
  { value: 0, label: '非常满意' },
  { value: 1, label: '满意' },
  { value: 2, label: '一般' },
  { value: 3, label: '不满意' },
  { value: 4, label: '非常不满意' },
]

export const ISI_ITEMS: readonly IsiItem[] = [
  {
    id: 'isi_1',
    order: 1,
    question: '入睡困难的严重程度',
    hint: '躺下后需要很久才能睡着',
    options: SEVERITY_OPTIONS,
  },
  {
    id: 'isi_2',
    order: 2,
    question: '睡眠维持困难的严重程度',
    hint: '夜间容易醒来',
    options: SEVERITY_OPTIONS,
  },
  {
    id: 'isi_3',
    order: 3,
    question: '早醒问题的严重程度',
    hint: '比期望的时间醒得早，且难以再次入睡',
    options: SEVERITY_OPTIONS,
  },
  {
    id: 'isi_4',
    order: 4,
    question: '对当前睡眠模式的满意程度',
    options: SATISFACTION_OPTIONS,
  },
  {
    id: 'isi_5',
    order: 5,
    question: '睡眠问题对白天功能的影响程度',
    hint: '影响工作、学习、记忆力或注意力',
    options: SEVERITY_OPTIONS,
  },
  {
    id: 'isi_6',
    order: 6,
    question: '睡眠问题在他人眼中被察觉的程度',
    hint: '别人是否看得出您因睡眠问题而状态不佳',
    options: SEVERITY_OPTIONS,
  },
  {
    id: 'isi_7',
    order: 7,
    question: '对当前睡眠问题的担心或苦恼程度',
    options: SEVERITY_OPTIONS,
  },
]

export const ISI_ITEM_IDS: readonly IsiItemId[] = ISI_ITEMS.map((i) => i.id)

export function getIsiItem(id: IsiItemId): IsiItem {
  const found = ISI_ITEMS.find((i) => i.id === id)
  if (!found) throw new Error(`未知的 ISI 条目：${id}`)
  return found
}
