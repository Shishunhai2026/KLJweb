/**
 * 按区块截取首页新增板块，用于核对插画效果。
 */
import { chromium } from 'playwright'

const b = await chromium.launch({ channel: 'msedge' })
const c = await b.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  locale: 'zh-CN',
})
const p = await c.newPage()
await p.goto('http://localhost:3200/', { waitUntil: 'networkidle' })

const targets = [
  ['睡不好，身体会先告诉你', '30-第三屏-身体症状.png'],
  ['睡眠对身体的深层次影响', '31-第四屏-深层影响.png'],
]

for (const [text, file] of targets) {
  const section = p.locator('section', { hasText: text }).first()
  await section.scrollIntoViewIfNeeded()
  await p.waitForTimeout(300)
  await section.screenshot({ path: `D:/客户/website/.preview/${file}` })
  console.log(`✓ ${file}`)
}

await b.close()
