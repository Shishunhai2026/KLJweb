import { chromium } from 'playwright'

const b = await chromium.launch({ channel: 'msedge' })
const c = await b.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  locale: 'zh-CN',
})
const p = await c.newPage()
await p.goto('http://localhost:3200/', { waitUntil: 'networkidle' })

for (const [text, file] of [
  ['睡不好，身体会先告诉你', '40-移动端-身体症状.png'],
  ['睡眠对身体的深层次影响', '41-移动端-深层影响.png'],
]) {
  const section = p.locator('section', { hasText: text }).first()
  await section.scrollIntoViewIfNeeded()
  await p.waitForTimeout(300)
  await section.screenshot({ path: `D:/客户/website/.preview/${file}` })
  console.log(`✓ ${file}`)
}

await b.close()
