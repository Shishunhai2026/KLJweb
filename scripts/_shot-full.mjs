import { chromium } from 'playwright'
const b = await chromium.launch({ channel: 'msedge' })
const c = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, locale: 'zh-CN' })
const p = await c.newPage()
await p.goto('http://localhost:3200/', { waitUntil: 'networkidle' })
await p.screenshot({ path: 'D:/客户/website/.preview/62-首页-紧凑首屏.png' })  // 仅首屏视图
console.log('✓ 首屏视图')
await c.close()
await b.close()
