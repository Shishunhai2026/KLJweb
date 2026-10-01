import { describe, expect, it } from 'vitest'

import { getBand, SEVERITY_BANDS } from '@/lib/isi/bands'
import { ISI_ITEMS, ISI_ITEM_IDS, type IsiAnswer, type IsiItemId } from '@/lib/isi/items'
import {
  calculateTotal,
  isValidAnswer,
  scoreIsi,
  scoreToBand,
  validateAnswers,
  type IsiAnswers,
} from '@/lib/isi/scoring'

/** 以全 0 为基础，覆盖指定条目的得分。参数放宽为 number，便于测试里直接写字面量。 */
function answersWith(value: Partial<Record<IsiItemId, number>>): IsiAnswers {
  const base = Object.fromEntries(ISI_ITEM_IDS.map((id) => [id, 0])) as IsiAnswers
  return { ...base, ...value } as IsiAnswers
}

describe('量表结构', () => {
  it('恰好 7 个条目，顺序为 1–7', () => {
    expect(ISI_ITEMS).toHaveLength(7)
    expect(ISI_ITEMS.map((i) => i.order)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('每个条目都有 0–4 五个选项', () => {
    for (const item of ISI_ITEMS) {
      expect(item.options.map((o) => o.value)).toEqual([0, 1, 2, 3, 4])
    }
  })

  it('第 4 题使用满意度锚点，与其他题目不同', () => {
    const item4 = ISI_ITEMS.find((i) => i.id === 'isi_4')
    const item1 = ISI_ITEMS.find((i) => i.id === 'isi_1')
    expect(item4?.options[0]?.label).toBe('非常满意')
    expect(item1?.options[0]?.label).toBe('无')
    // 满意度越高 → 分数越低，方向与严重程度题一致（都是分高问题重）
    expect(item4?.options[4]?.label).toBe('非常不满意')
  })
})

describe('isValidAnswer', () => {
  it.each([0, 1, 2, 3, 4])('接受 %i', (v) => {
    expect(isValidAnswer(v)).toBe(true)
  })

  it.each([-1, 5, 2.5, NaN, Infinity, '2', null, undefined, {}])('拒绝 %p', (v) => {
    expect(isValidAnswer(v)).toBe(false)
  })
})

describe('calculateTotal', () => {
  it('全 0 得 0 分', () => {
    expect(calculateTotal(answersWith({}))).toBe(0)
  })

  it('全 4 得 28 分', () => {
    const all4 = Object.fromEntries(ISI_ITEM_IDS.map((id) => [id, 4])) as IsiAnswers
    expect(calculateTotal(all4)).toBe(28)
  })

  it('逐题相加正确', () => {
    expect(
      calculateTotal(
        answersWith({ isi_1: 4, isi_2: 3, isi_3: 2, isi_4: 1, isi_5: 0, isi_6: 2, isi_7: 1 }),
      ),
    ).toBe(13)
  })

  it('答案非法时抛错，而不是静默算出一个偏低的分', () => {
    const broken = answersWith({}) as Record<string, unknown>
    broken.isi_3 = 9
    expect(() => calculateTotal(broken as IsiAnswers)).toThrow(RangeError)
  })
})

describe('scoreToBand 边界', () => {
  // 需求文档 §6.1 的四个区间：0–7 / 8–14 / 15–21 / 22–28
  it.each([
    [0, 'none'],
    [7, 'none'],
    [8, 'subthreshold'],
    [14, 'subthreshold'],
    [15, 'moderate'],
    [21, 'moderate'],
    [22, 'severe'],
    [28, 'severe'],
  ])('总分 %i → %s', (score, band) => {
    expect(scoreToBand(score)).toBe(band)
  })

  it.each([-1, 29, 100, 2.5, NaN])('越界分数 %p 抛错', (score) => {
    expect(() => scoreToBand(score)).toThrow(RangeError)
  })

  it('四个区间首尾相接，不重不漏地覆盖 0–28', () => {
    for (let score = 0; score <= 28; score += 1) {
      expect(() => scoreToBand(score)).not.toThrow()
    }
    expect(SEVERITY_BANDS[0]?.min).toBe(0)
    expect(SEVERITY_BANDS[SEVERITY_BANDS.length - 1]?.max).toBe(28)
    for (let i = 0; i < SEVERITY_BANDS.length - 1; i += 1) {
      expect(SEVERITY_BANDS[i]!.max + 1).toBe(SEVERITY_BANDS[i + 1]!.min)
    }
  })
})

describe('单调性', () => {
  it('任意单题得分上升，总分不会下降', () => {
    const base = answersWith({ isi_1: 2, isi_2: 2, isi_3: 2, isi_4: 2, isi_5: 2, isi_6: 2, isi_7: 2 })
    const baseTotal = calculateTotal(base)

    for (const id of ISI_ITEM_IDS) {
      for (let v = base[id] + 1; v <= 4; v += 1) {
        const bumped = { ...base, [id]: v as IsiAnswer }
        expect(calculateTotal(bumped)).toBeGreaterThanOrEqual(baseTotal)
      }
    }
  })
})

describe('validateAnswers', () => {
  it('完整作答通过，并归一为完整对象', () => {
    const result = validateAnswers(answersWith({ isi_1: 3 }))
    expect(result.valid).toBe(true)
    if (result.valid) {
      expect(result.answers.isi_1).toBe(3)
      expect(Object.keys(result.answers)).toHaveLength(7)
    }
  })

  it('缺题时一次性报出全部缺失项', () => {
    const result = validateAnswers({ isi_1: 1 })
    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.errors).toHaveLength(6)
    }
  })

  it('越界答案被拒绝', () => {
    const result = validateAnswers({ ...answersWith({}), isi_2: 7 })
    expect(result.valid).toBe(false)
  })
})

describe('scoreIsi', () => {
  it('返回总分与分级', () => {
    const result = scoreIsi(answersWith({ isi_1: 4, isi_2: 4, isi_3: 4, isi_4: 4, isi_5: 4, isi_6: 2, isi_7: 0 }))
    expect(result.total).toBe(22)
    expect(result.band).toBe('severe')
  })
})

describe('getBand 与分级定义', () => {
  it('每个区间返回对应定义', () => {
    expect(getBand(0).slug).toBe('none')
    expect(getBand(28).slug).toBe('severe')
  })

  it('越界抛 RangeError', () => {
    expect(() => getBand(29)).toThrow(RangeError)
    expect(() => getBand(-1)).toThrow(RangeError)
  })
})
