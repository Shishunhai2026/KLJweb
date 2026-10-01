import { describe, expect, it } from 'vitest'

import { COMPANY_SUPPLIED_MARKER } from '@/lib/content/evidence'
import {
  containsProductMention,
  enforceEvidenceMarkers,
  evaluatePostGuardrails,
  evaluatePreGuardrails,
  scanForbiddenClaims,
} from '@/lib/ai/guardrails'
import { getEmergencyRules, getForbiddenClaimsRules, getRefusalRules } from '@/lib/ai/guardrails/rules'

describe('护栏规则文件本身', () => {
  it('三个规则文件都能加载并通过 Schema 校验', () => {
    expect(getEmergencyRules().triggers.length).toBeGreaterThan(0)
    expect(getRefusalRules().refusals.length).toBeGreaterThan(0)
    expect(getForbiddenClaimsRules().patterns.length).toBeGreaterThan(0)
  })

  it('正则模式全部可编译，且每条规则 id 唯一', () => {
    const rules = getForbiddenClaimsRules()
    const ids = rules.patterns.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)

    for (const rule of rules.patterns) {
      expect(() => new RegExp(rule.regex, 'i')).not.toThrow()
    }
  })

  it('固定拒绝话术的 id 唯一，且优先级为整数', () => {
    const refusals = getRefusalRules().refusals
    expect(new Set(refusals.map((r) => r.id)).size).toBe(refusals.length)
    for (const r of refusals) expect(Number.isInteger(r.priority)).toBe(true)
  })
})

describe('急症升级（需求文档 §20 的安全底线）', () => {
  it.each([
    ['我不想活了', 'self-harm-risk'],
    ['最近总是想死', 'self-harm-risk'],
    ['半夜胸口疼得厉害', 'acute-cardiac'],
    ['突然喘不上气', 'acute-cardiac'],
    ['昨天晕倒了', 'neuro-emergency'],
    ['半边身体发麻', 'neuro-emergency'],
    ['晚上听到有人说话', 'severe-mental'],
  ])('「%s」升级为急症，命中 %s', (message, expectedId) => {
    const decision = evaluatePreGuardrails(message)
    expect(decision.action).toBe('escalate_emergency')
    expect(decision.ruleId).toBe(`emergency:${expectedId}`)
    expect(decision.response).toBeTruthy()
  })

  it('急症话术包含急救与心理援助热线，且不经过大模型', () => {
    const decision = evaluatePreGuardrails('我不想活了')
    expect(decision.response).toContain('120')
    // 12356 为国家卫健委全国统一心理援助热线，2025-05-01 起全国开通
    expect(decision.response).toContain('12356')
    // 固定话术标志：调用方见到 escalate_emergency 就不再走生成流程
    expect(decision.action).not.toBe('allow')
  })

  it('急症判定优先于其他所有规则', () => {
    // 同时包含「停安眠药」与急症词，必须判定为急症
    const decision = evaluatePreGuardrails('我想停掉安眠药，反正我也不想活了')
    expect(decision.action).toBe('escalate_emergency')
  })
})

describe('固定拒绝话术（需求文档 §20）', () => {
  it.each([
    ['我吃安眠药，可以换成和颐林吗？', 'medication-substitution'],
    ['吃了几年安眠药，能停掉吗', 'medication-substitution'],
    ['这个产品能治好失眠吗', 'disease-treatment'],
    ['你们的东西对失眠有没有效果', 'disease-treatment'],
    ['我是不是得了失眠症', 'diagnosis-request'],
    ['帮我诊断一下我这是什么病', 'diagnosis-request'],
    ['网上有人说喝了就好了，是不是真的有效', 'testimonial-as-evidence'],
    ['用户反馈能说明产品有效吗', 'testimonial-as-evidence'],
    ['孕妇能不能喝', 'special-population'],
    ['小孩可以吃吗', 'special-population'],
    ['我有糖尿病能不能吃', 'special-population'],
    ['一天喝几袋效果更好', 'overdose-usage'],
  ])('「%s」→ 固定拒绝 %s', (message, expectedId) => {
    const decision = evaluatePreGuardrails(message)
    expect(decision.action).toBe('refuse_canonical')
    expect(decision.ruleId).toBe(`refusal:${expectedId}`)
    expect(decision.disclaimer).toBeTruthy()
  })

  it('安眠药问题的话术与需求文档 §20 的口径一致', () => {
    const decision = evaluatePreGuardrails('我吃安眠药，可以换成和颐林吗？')
    expect(decision.response).toContain('不建议自行停用或替换处方药')
    expect(decision.response).toContain('不能替代医生的诊疗建议')
  })

  it('拒绝话术本身不含任何违禁表述', () => {
    for (const refusal of getRefusalRules().refusals) {
      const scan = scanForbiddenClaims(refusal.response, 'ai-output')
      expect(scan.violations, `规则 ${refusal.id} 的话术含违禁词`).toEqual([])
    }
  })

  it('急症话术本身不含任何违禁表述', () => {
    for (const trigger of getEmergencyRules().triggers) {
      const scan = scanForbiddenClaims(trigger.response, 'ai-output')
      expect(scan.violations, `规则 ${trigger.id} 的话术含违禁词`).toEqual([])
    }
  })
})

describe('超出范围', () => {
  it('与睡眠无关的问题被礼貌挡回', () => {
    const decision = evaluatePreGuardrails('帮我看看今天股票怎么样')
    expect(decision.action).toBe('out_of_scope')
  })

  it('空消息被挡回', () => {
    const decision = evaluatePreGuardrails('   ')
    expect(decision.action).toBe('out_of_scope')
  })
})

describe('放行', () => {
  it.each([
    '半夜总是醒怎么办',
    '躺下很久睡不着',
    '凌晨三点醒了就睡不着了',
    '睡得不沉一点声音就醒',
  ])('正常睡眠问题「%s」放行', (message) => {
    const decision = evaluatePreGuardrails(message)
    expect(decision.action).toBe('allow')
  })
})

describe('违禁表述扫描', () => {
  it.each([
    ['本产品可以治愈失眠', 'absolute:治愈'],
    ['坚持吃就能根治', 'absolute:根治'],
    ['可以抑制肿瘤生长', 'pattern:tumor-suppression-claim'],
    ['可以修复神经细胞', 'absolute:修复神经细胞'],
  ])('绝对禁用词：%s', (text, ruleId) => {
    const result = scanForbiddenClaims(text, 'ai-output')
    expect(result.clean).toBe(false)
    expect(result.violations.map((v) => v.ruleId)).toContain(ruleId)
  })

  it.each([
    '总有效率达到 93.3%',
    '服用 7 天即可见效',
    '临床已证明本产品有效',
    '可以替代安眠药',
    '所有人都有效',
    '保证有效',
    '不会产生依赖',
  ])('正则模式命中：%s', (text) => {
    const result = scanForbiddenClaims(text, 'ai-output')
    expect(result.clean, `未命中：${text}`).toBe(false)
  })

  it('正常科普文本不会被误伤', () => {
    const text =
      '半夜偶尔醒来属于常见现象。如果频繁发生并影响白天状态，可以从作息、环境、咖啡因等方向排查。是否需要治疗应由医生评估。'
    expect(scanForbiddenClaims(text, 'ai-output').clean).toBe(true)
  })

  it('Quick Answer 语境下额外禁止夹带产品信息', () => {
    const text = '半夜醒来属于常见现象，可以记录睡眠情况并调整作息。' + '和颐林睡眠大师可以帮助改善。'
    const result = scanForbiddenClaims(text, 'quick-answer')
    expect(result.violations.map((v) => v.kind)).toContain('product-mention')
  })

  it('product-body 语境只保留绝对禁用词', () => {
    // 语境禁用词在 product-body 下放行（产品表述由 claims 字段单独管控）
    expect(scanForbiddenClaims('总有效率达到 93.3%', 'product-body').clean).toBe(true)
    // 但绝对禁用词仍然拦截
    expect(scanForbiddenClaims('可以治愈失眠', 'product-body').clean).toBe(false)
  })

  it('containsProductMention 识别产品名与促销词', () => {
    expect(containsProductMention('和颐林的产品')).toBe(true)
    expect(containsProductMention('现在下单有优惠')).toBe(true)
    expect(containsProductMention('睡眠周期大约 90 分钟')).toBe(false)
  })
})

describe('后置护栏', () => {
  it('干净文本放行', () => {
    const result = evaluatePostGuardrails('半夜醒来可以先记录睡眠情况，再观察几天的规律。')
    expect(result.action).toBe('allow')
  })

  it('含违禁表述的生成结果要求重写（降级为模板回答）', () => {
    const result = evaluatePostGuardrails('坚持服用可以治愈失眠，总有效率达到 95%。')
    expect(result.action).toBe('rewrite_required')
    expect(result.violations.length).toBeGreaterThan(0)
  })

  it('引用 Level 3+ 资料时自动补上核验标记', () => {
    const text = '相关企业资料中提到了一些观察结果。'
    const withMarker = enforceEvidenceMarkers(text, [5])
    expect(withMarker).toContain(COMPANY_SUPPLIED_MARKER)
  })

  it('已含标记时不重复添加', () => {
    const text = `说明文字。\n> ${COMPANY_SUPPLIED_MARKER}`
    expect(enforceEvidenceMarkers(text, [4])).toBe(text)
  })

  it('仅引用 Level 1–2 资料时不添加标记', () => {
    const text = '根据公开教材的说明，睡眠周期约为 90 分钟。'
    expect(enforceEvidenceMarkers(text, [1, 2])).toBe(text)
  })

  it('无引用来源时不添加标记', () => {
    const text = '这是一段普通回答。'
    expect(enforceEvidenceMarkers(text, [])).toBe(text)
  })
})
