import { describe, expect, it } from 'vitest'

import { ISI_ITEM_IDS, type IsiItemId } from '@/lib/isi/items'
import { buildIsiResult, inferLikelyProblems, RESULT_SECTION_ORDER } from '@/lib/isi/recommend'
import { scoreIsi, type IsiAnswers } from '@/lib/isi/scoring'

/** 以全 0 为基础，覆盖指定条目的得分。参数放宽为 number，便于测试里直接写字面量。 */
function answersWith(value: Partial<Record<IsiItemId, number>>): IsiAnswers {
  const base = Object.fromEntries(ISI_ITEM_IDS.map((id) => [id, 0])) as IsiAnswers
  return { ...base, ...value } as IsiAnswers
}

describe('转化顺序契约（需求文档 §6.2）', () => {
  it('产品区块永远是最后一个', () => {
    expect(RESULT_SECTION_ORDER[RESULT_SECTION_ORDER.length - 1]).toBe('productTeaser')
  })

  it('推荐阅读排在产品之前', () => {
    expect(RESULT_SECTION_ORDER.indexOf('articles')).toBeLessThan(
      RESULT_SECTION_ORDER.indexOf('productTeaser'),
    )
  })


  it.each([
    ['none', answersWith({ isi_1: 1 })],
    ['subthreshold', answersWith({ isi_1: 2, isi_2: 2, isi_3: 2, isi_5: 1 })],
    ['moderate', answersWith({ isi_1: 4, isi_2: 4, isi_3: 4, isi_5: 3 })],
    ['severe', answersWith({ isi_1: 4, isi_2: 4, isi_3: 4, isi_4: 4, isi_5: 4, isi_6: 4, isi_7: 4 })],
  ])('分级 %s 的实际渲染顺序保持契约', (_label, answers) => {
    const view = buildIsiResult(scoreIsi(answers))
    const sections = view.sections

    // 顺序必须与 RESULT_SECTION_ORDER 的过滤结果完全一致
    const expected = RESULT_SECTION_ORDER.filter((s) => sections.includes(s))
    expect(sections).toEqual(expected)

    // 产品入口只要出现，就必须是最后一个；且所有内容区块都要排在它前面。
    // 注意：最低档（none）完全不渲染产品入口，此时 indexOf 返回 -1，
    // 因此这些断言必须在「产品入口存在」的前提下才成立。
    if (sections.includes('productTeaser')) {
      expect(sections[sections.length - 1]).toBe('productTeaser')
      expect(sections.indexOf('articles')).toBeLessThan(sections.indexOf('productTeaser'))
      expect(sections.indexOf('advice')).toBeLessThan(sections.indexOf('productTeaser'))
    } else {
      expect(view.showProductTeaser).toBe(false)
    }
  })

  it('分数 0–7 时完全不展示产品入口', () => {
    const view = buildIsiResult(scoreIsi(answersWith({ isi_1: 1, isi_2: 1 })))
    expect(view.score.band).toBe('none')
    expect(view.showProductTeaser).toBe(false)
    expect(view.sections).not.toContain('productTeaser')
  })

  it('分数 8 及以上才出现产品入口', () => {
    const view = buildIsiResult(scoreIsi(answersWith({ isi_1: 4, isi_2: 4 })))
    expect(view.score.band).toBe('subthreshold')
    expect(view.showProductTeaser).toBe(true)
    expect(view.sections).toContain('productTeaser')
  })
})

describe('inferLikelyProblems', () => {
  it('入睡困难突出时归为 difficulty-initiating', () => {
    expect(inferLikelyProblems(answersWith({ isi_1: 4 }))).toContain('difficulty-initiating')
  })

  it('夜间易醒突出时归为 night-awakening', () => {
    expect(inferLikelyProblems(answersWith({ isi_2: 3 }))).toContain('night-awakening')
  })

  it('早醒突出时归为 early-awakening', () => {
    expect(inferLikelyProblems(answersWith({ isi_3: 2 }))).toContain('early-awakening')
  })

  it('白天影响突出时归为 daytime-fatigue', () => {
    expect(inferLikelyProblems(answersWith({ isi_5: 4 }))).toContain('daytime-fatigue')
  })

  it('多个维度同时突出时按得分从高到低排序', () => {
    const result = inferLikelyProblems(answersWith({ isi_1: 2, isi_2: 4, isi_3: 3 }))
    expect(result).toEqual(['night-awakening', 'early-awakening', 'difficulty-initiating'])
  })

  it('各维度都不突出但总分偏高时归为整体睡眠质量下降', () => {
    // 每项 1 分 × 7 = 7 分，低于 8 分门槛
    const low = answersWith({ isi_1: 1, isi_2: 1, isi_3: 1, isi_4: 1, isi_5: 1, isi_6: 1, isi_7: 1 })
    expect(inferLikelyProblems(low)).toEqual([])

    // 每项 2 分 × 7 = 14 分，但没有单项达到「突出」阈值以外的路径
    const mid = answersWith({ isi_4: 4, isi_7: 4 })
    expect(inferLikelyProblems(mid)).toEqual(['poor-sleep-quality'])
  })

  it('对同一份作答是确定性的（同样输入必得同样输出）', () => {
    const answers = answersWith({ isi_1: 3, isi_2: 3, isi_3: 3 })
    expect(inferLikelyProblems(answers)).toEqual(inferLikelyProblems(answers))
  })
})

describe('buildIsiResult', () => {
  it('带出分级名称与解读文案', () => {
    const view = buildIsiResult(scoreIsi(answersWith({ isi_1: 4, isi_2: 4, isi_3: 4, isi_4: 4, isi_5: 4 })))
    expect(view.bandLabel).toBe('中度失眠')
    expect(view.bandSummary.length).toBeGreaterThan(10)
  })

  it('每个分级都给得出改善建议', () => {
    for (const answers of [
      answersWith({}),
      answersWith({ isi_1: 3 }),
      answersWith({ isi_1: 4, isi_2: 4, isi_3: 4 }),
      answersWith({ isi_1: 4, isi_2: 4, isi_3: 4, isi_4: 4, isi_5: 4, isi_6: 4, isi_7: 4 }),
    ]) {
      const view = buildIsiResult(scoreIsi(answers))
      expect(view.advice.length).toBeGreaterThan(0)
      for (const line of view.advice) expect(line.length).toBeGreaterThan(6)
    }
  })

  it('改善建议中不含任何产品信息', () => {
    for (const answers of [answersWith({ isi_1: 4 }), answersWith({ isi_1: 4, isi_2: 4, isi_3: 4 })]) {
      const view = buildIsiResult(scoreIsi(answers))
      for (const line of view.advice) {
        expect(line).not.toMatch(/和颐林|睡眠大师|产品|购买|下单/)
      }
    }
  })

  it('重度分级的建议包含就医引导', () => {
    const view = buildIsiResult(
      scoreIsi(answersWith({ isi_1: 4, isi_2: 4, isi_3: 4, isi_4: 4, isi_5: 4, isi_6: 4, isi_7: 4 })),
    )
    expect(view.bandLabel).toBe('重度失眠')
    expect(view.advice.join('')).toContain('就诊')
  })
})
