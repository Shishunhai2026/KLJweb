/**
 * 站点截图脚本（仅用于开发期预览，不属于交付产物）。
 * 使用系统已安装的 Edge，避免下载 Chromium。
 *
 * 用法：node scripts/_screenshot.mjs [baseUrl]
 */
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const BASE = process.argv[2] ?? 'http://localhost:3200'
const OUT = 'D:/客户/website/.preview'

const PAGES = [
  { path: '/', name: '01-首页', full: false },
  { path: '/', name: '02-首页完整', full: true },
  { path: '/sleep/problems', name: '03-睡眠问题总览', full: false },
  { path: '/sleep/problems/night-awakening', name: '04-夜间易醒专题', full: true },
  { path: '/knowledge/what-is-sleep-cycle', name: '05-文章详情', full: true },
  { path: '/sleep/self-test', name: '06-睡眠自测', full: false },
  { path: '/product', name: '07-产品中心', full: false },
  { path: '/product/ingredients', name: '14-产品配方', full: false },
  { path: '/product/usage', name: '15-使用方法', full: false },
  { path: '/product/faq', name: '16-产品FAQ', full: false },
  { path: '/product/testing', name: '08-检测资料', full: true },
  { path: '/testimonials', name: '10-用户反馈', full: false },
  { path: '/medical-disclaimer', name: '11-健康免责声明', full: false },
]

await mkdir(OUT, { recursive: true })

const browser = await chromium.launch({ channel: 'msedge' })
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  locale: 'zh-CN',
})

const page = await context.newPage()
const errors = []
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(`[${msg.location().url}] ${msg.text()}`)
})
page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`))

for (const item of PAGES) {
  const url = `${BASE}${item.path}`
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
  await page.screenshot({
    path: `${OUT}/${item.name}.png`,
    fullPage: Boolean(item.full),
  })
  console.log(`✓ ${item.name}  ← ${item.path}`)
}

// 移动端视图
const mobile = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  locale: 'zh-CN',
})
const mPage = await mobile.newPage()
await mPage.goto(`${BASE}/`, { waitUntil: 'networkidle' })
await mPage.screenshot({ path: `${OUT}/12-移动端首页.png`, fullPage: false })
console.log('✓ 12-移动端首页')
await mPage.goto(`${BASE}/sleep/self-test`, { waitUntil: 'networkidle' })
await mPage.screenshot({ path: `${OUT}/13-移动端自测.png`, fullPage: false })
console.log('✓ 13-移动端自测')

await browser.close()

if (errors.length > 0) {
  console.log('\n⚠ 控制台错误：')
  for (const e of [...new Set(errors)]) console.log('  ' + e)
} else {
  console.log('\n控制台无错误')
}
