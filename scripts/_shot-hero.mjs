import { chromium } from 'playwright'
const b = await chromium.launch({ channel: 'msedge' })
for (const [w, name] of [[1440, '60-首屏-桌面'], [390, '61-首屏-移动端']]) {
  const c = await b.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 2, locale: 'zh-CN' })
  const p = await c.newPage()
  await p.goto('http://localhost:3200/', { waitUntil: 'networkidle' })
  const hero = p.locator('section').first()
  const box = await hero.boundingBox()
  console.log(`${name}: 首屏高度 ${Math.round(box.height)}px (宽 ${w})`)
  await hero.screenshot({ path: `D:/客户/website/.preview/${name}.png` })
  await c.close()
}
await b.close()
