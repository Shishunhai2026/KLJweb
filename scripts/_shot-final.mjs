import { chromium } from 'playwright'
const b = await chromium.launch({ channel: 'msedge' })
const c = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, locale: 'zh-CN' })
const p = await c.newPage()

await p.goto('http://localhost:3200/', { waitUntil: 'networkidle' })
await p.screenshot({ path: 'D:/客户/website/.preview/50-首页-移除AI后.png', fullPage: true })

// 自测结果页（走完 7 题）
await p.goto('http://localhost:3200/sleep/self-test', { waitUntil: 'networkidle' })
await p.getByRole('button', { name: '开始自测' }).click()
await p.waitForTimeout(300)
for (let i = 0; i < 7; i++) {
  await p.getByRole('button', { name: /^3/ }).first().click()
  await p.waitForTimeout(220)
}
await p.waitForTimeout(400)
const txt = await p.textContent('body')
console.log('结果页含 AI 入口:', /AI 睡眠助手|与 AI/.test(txt))
console.log('产品入口存在:', txt.includes('了解和颐林睡眠大师'))
console.log('产品在最后:', txt.lastIndexOf('了解和颐林睡眠大师') > txt.lastIndexOf('可以尝试的改善方向'))
await p.screenshot({ path: 'D:/客户/website/.preview/51-自测结果-移除AI后.png', fullPage: true })
await b.close()
