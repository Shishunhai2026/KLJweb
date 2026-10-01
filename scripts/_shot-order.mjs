import { chromium } from 'playwright'
const b = await chromium.launch({ channel: 'msedge' })
const c = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, locale: 'zh-CN' })
const p = await c.newPage()
await p.goto('http://localhost:3200/', { waitUntil: 'networkidle' })

// 读出首页各区块的实际顺序
const order = await p.$$eval('main > section, main > div > section', (els) =>
  els.map((el) => {
    const h = el.querySelector('h1, h2')
    return h ? h.textContent.trim().slice(0, 22) : '(无标题)'
  })
)
console.log('首页区块实际顺序：')
order.forEach((t, i) => console.log(`  ${i + 1}. ${t}`))

await p.screenshot({ path: 'D:/客户/website/.preview/70-首页-新顺序-首屏.png' })
await p.screenshot({ path: 'D:/客户/website/.preview/71-首页-新顺序-完整.png', fullPage: true })
await b.close()
