/**
 * 交互流程验证（开发期预览用）。
 * 实际点一遍睡眠自测与 AI 助手，截图并断言关键行为。
 */
import { chromium } from 'playwright'

const BASE = 'http://localhost:3200'
const OUT = 'D:/客户/website/.preview'

const browser = await chromium.launch({ channel: 'msedge' })
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  locale: 'zh-CN',
})
const page = await ctx.newPage()

// ---------- 1. 睡眠自测全流程 ----------
console.log('=== 睡眠自测 ===')
await page.goto(`${BASE}/sleep/self-test`, { waitUntil: 'networkidle' })
await page.getByRole('button', { name: '开始自测' }).click()
await page.waitForTimeout(400)

// 逐题作答：全选「重度」（3 分），总分 21 → 中度失眠
for (let i = 0; i < 7; i += 1) {
  const before = await page.textContent('body')
  if (!before.includes(`第 ${i + 1} / 7 题`)) {
    console.log(`  ⚠ 第 ${i + 1} 题未按预期显示`)
  }
  await page.getByRole('button', { name: /^3/ }).first().click()
  await page.waitForTimeout(250)
}

const resultText = await page.textContent('body')
const checks = {
  '总分 21 显示': resultText.includes('21'),
  '分级为中度失眠': resultText.includes('中度失眠'),
  '显示自测免责声明': resultText.includes('不能替代医生诊断'),
  '推荐阅读区块': resultText.includes('推荐阅读'),
  'AI 助手引导': resultText.includes('与 AI 睡眠助手聊聊'),
  '末位是产品入口': resultText.lastIndexOf('了解和颐林睡眠大师') > resultText.lastIndexOf('与 AI 睡眠助手聊聊'),
}
for (const [k, v] of Object.entries(checks)) console.log(`  ${v ? '✓' : '✗'} ${k}`)

await page.screenshot({ path: `${OUT}/20-自测结果.png`, fullPage: true })
console.log('  ✓ 已截图 20-自测结果')

// ---------- 2. AI 助手安全路径 ----------
console.log('\n=== AI 睡眠助手 ===')
await page.goto(`${BASE}/ai-sleep-assistant`, { waitUntil: 'networkidle' })
await page.getByRole('button', { name: '我吃安眠药，可以换成和颐林吗？' }).click().catch(async () => {
  await page.fill('#ai-chat-input', '我吃安眠药，可以换成和颐林吗？')
  await page.getByRole('button', { name: '发送' }).click()
})
await page.waitForTimeout(2500)

const guardText = await page.textContent('body')
const g = {
  '命中固定拒绝话术': guardText.includes('不建议自行停用或替换处方药'),
  '标注未经 AI 处理': guardText.includes('未经过 AI 模型处理'),
}
for (const [k, v] of Object.entries(g)) console.log(`  ${v ? '✓' : '✗'} ${k}`)
await page.screenshot({ path: `${OUT}/21-AI安全话术.png`, fullPage: false })

await browser.close()
