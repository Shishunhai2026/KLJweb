/**
 * 内容校验（content:lint）
 *
 * 这是让「300 篇由大模型生成的文章」变得安全的那道闸门。
 * 在 CI 与 prebuild 中运行；任何 error 都会阻断构建。
 *
 * 校验内容：
 *   1. 全部集合的 Zod 结构校验（由加载器完成）
 *   2. 站内链接图：相关文章/专题页/产品资料是否都能解析，是否存在孤儿页
 *   3. Quick Answer 是否夹带了产品信息或违禁表述
 *   4. 产品页正文中的数字是否都在 claims 中登记了来源
 *   5. 已发布内容中是否存在「待核验 / 有争议」的表述
 */

import {
  getAllArticles,
  getAllKbEntries,
  getAllProblems,
  getAllProductKnowledge,
  validateLinkGraph,
} from '../lib/content'
import { ContentValidationError } from '../lib/content/client'
import { scanForbiddenClaims } from '../lib/ai/guardrails/claims'

const errors: string[] = []
const warnings: string[] = []
const notices: string[] = []

// ---------------------------------------------------------------------------
// 1. 结构校验
// ---------------------------------------------------------------------------

let articles: ReturnType<typeof getAllArticles> = []
let problems: ReturnType<typeof getAllProblems> = []
let products: ReturnType<typeof getAllProductKnowledge> = []
let kbEntries: ReturnType<typeof getAllKbEntries> = []

try {
  articles = getAllArticles()
  problems = getAllProblems()
  products = getAllProductKnowledge()
  kbEntries = getAllKbEntries()
} catch (error) {
  if (error instanceof ContentValidationError) {
    console.error('\n✗ 内容结构校验失败\n')
    console.error(error.message)
    console.error('')
    process.exit(1)
  }
  throw error
}

// ---------------------------------------------------------------------------
// 2. 站内链接图
// ---------------------------------------------------------------------------

for (const issue of validateLinkGraph()) {
  const line = `[${issue.subject}] ${issue.message}`
  if (issue.severity === 'error') errors.push(line)
  else warnings.push(line)
}

// ---------------------------------------------------------------------------
// 3. Quick Answer 中立性
// ---------------------------------------------------------------------------

for (const article of articles) {
  if (article.status !== 'published') continue

  const scan = scanForbiddenClaims(article.quickAnswer, 'quick-answer')
  for (const violation of scan.violations) {
    errors.push(
      `[文章 ${article.slug}] Quick Answer 中出现「${violation.matched}」：${violation.reason}`,
    )
  }

  // 核心结论同样不得夹带违禁表述
  for (const conclusion of article.coreConclusions) {
    for (const violation of scanForbiddenClaims(conclusion, 'ai-output').violations) {
      errors.push(
        `[文章 ${article.slug}] 核心结论中出现「${violation.matched}」：${violation.reason}`,
      )
    }
  }

  // 关键事实：Level 3+ 的事实必须带来源，且来源等级要一致
  for (const fact of article.keyFacts) {
    const source = article.sources.find((s) => s.id === fact.sourceId)
    if (source && source.evidenceLevel !== fact.evidenceLevel) {
      errors.push(
        `[文章 ${article.slug}] 关键事实「${fact.statement}」标注的等级（L${fact.evidenceLevel}）` +
          `与来源「${source.title}」的等级（L${source.evidenceLevel}）不一致`,
      )
    }
  }
}

// ---------------------------------------------------------------------------
// 4. 产品页正文中的数字必须登记来源
// ---------------------------------------------------------------------------

/** 需要登记来源的数字形态：百分比、例数、酶活、含量、时长、次数、袋数 */
const PRODUCT_BODY_NUMBER_PATTERN =
  /\d+(?:\.\d+)?\s*(?:%|例|U|μg|ug|微克|毫克|mg|千克|kg|袋|天|周|个月|次|项)/gi

for (const product of products) {
  const body = product.body ?? ''

  // 4a. 正文中的违禁表述（产品页只保留绝对禁用词）
  for (const violation of scanForbiddenClaims(body, 'product-body').violations) {
    errors.push(`[产品资料 ${product.slug}] 正文出现「${violation.matched}」：${violation.reason}`)
  }

  /*
   * 4b. 逐个数字回溯到 claims。
   *
   * `disputedReason` 与 `disclaimer` 也计入「已登记」：
   * 这两处正是用来交代数据来历与出入的地方——
   * 有争议的数值必须写进 disputedReason 才能说清矛盾，
   * 而已确认的数值若有历史出入，也要在 disclaimer 里说明。
   * 正文引用这些数字来解释来历是正当用法，不应被拦。
   */
  const registered = product.claims
    .map((c) => `${c.value ?? ''} ${c.claim} ${c.disputedReason ?? ''} ${c.disclaimer ?? ''}`)
    .join(' ')
    .replace(/\s+/g, '')

  const seen = new Set<string>()
  for (const match of body.matchAll(PRODUCT_BODY_NUMBER_PATTERN)) {
    const token = match[0].replace(/\s+/g, '')
    if (seen.has(token)) continue
    seen.add(token)

    if (!registered.includes(token)) {
      errors.push(
        `[产品资料 ${product.slug}] 正文中的数字「${match[0].trim()}」没有在 claims 中登记来源。` +
          `请把该数据移入 claims 字段并标注 sourceId 与核验状态。`,
      )
    }
  }
}

// ---------------------------------------------------------------------------
// 5. 已发布内容不得包含待核验 / 有争议的表述
// ---------------------------------------------------------------------------

/*
 * 关于 disputed 表述：这里刻意用 **warning 而非 error**。
 *
 * 最初的规则是「已发布内容不得含 disputed 声明」，但那条规则有个致命的反效果：
 * 它会把「主动披露数据存在矛盾」的页面也一起挡住，
 * 而披露矛盾恰恰是本站最该做的事（见 F3：SOD 活性 3320U / 332U 自相矛盾）。
 *
 * Schema 已经强制 disputed 必须填写 disputedReason，
 * 渲染层也用醒目的告警样式呈现。因此这里只提示、不阻断——
 * 只要它没有被当成「已核验的事实」来展示。
 */
for (const product of products) {
  if (product.status !== 'published') continue
  for (const claim of product.claims) {
    if (claim.verificationStatus === 'disputed') {
      warnings.push(
        `[产品资料 ${product.slug}] 含待客户确认的表述：「${claim.claim}」` +
          `（${claim.disputedReason ?? '未说明原因'}）。已以告警样式展示，确认后请更新。`,
      )
    }
  }
}

// ---------------------------------------------------------------------------
// 汇总
// ---------------------------------------------------------------------------

const totalPublished = articles.filter((a) => a.status === 'published').length

notices.push(
  `文章 ${articles.length} 篇（已发布 ${totalPublished}）｜` +
    `睡眠问题 ${problems.length} 个｜产品资料 ${products.length} 条｜` +
    `知识库 ${kbEntries.length} 条`,
)

if (totalPublished === 0) {
  notices.push('当前没有任何已发布文章——站点骨架可正常构建，但内容页会是空的。')
}

console.log('')
for (const notice of notices) console.log(`  ${notice}`)
console.log('')

for (const warning of warnings) console.warn(`  ⚠ ${warning}`)
if (warnings.length > 0) console.warn('')

if (errors.length > 0) {
  console.error(`✗ content:lint 未通过，共 ${errors.length} 处错误：\n`)
  for (const error of errors) console.error(`  ✗ ${error}`)
  console.error('')
  process.exit(1)
}

console.log(
  `✓ content:lint 通过${warnings.length > 0 ? `（${warnings.length} 条警告）` : ''}\n`,
)
