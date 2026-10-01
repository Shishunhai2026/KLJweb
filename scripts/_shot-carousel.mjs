/**
 * 首屏验证脚本（开发期预览用，不属于交付产物）。
 * 1) 采样实际切换的图与间隔，确认「2 秒一张」且每张都轮到；
 * 2) 截「首屏视口」与「前两屏」两种视图，确认 banner 是否撑满第一屏、文案是否已下移。
 *
 * 用法：node scripts/_shot-carousel.mjs [baseUrl]
 */
import { chromium } from 'playwright'

const BASE = process.argv[2] ?? 'http://localhost:3200'
const OUT = 'D:/客户/website/.preview'

const VIEWPORTS = [
  { width: 1440, height: 900, name: '桌面', topHeight: 1500 },
  { width: 390, height: 844, name: '移动端', topHeight: 1200 },
]

/** 读出当前不透明度为 1 的那张轮播图。 */
const readActive = (page) =>
  page.evaluate(() => {
    const hero = document.querySelector('section')
    if (!hero) return null
    const imgs = [...hero.querySelectorAll('img')]
    const shown = imgs.find((img) => getComputedStyle(img).opacity === '1')
    return shown ? shown.getAttribute('src') : null
  })

/** 读出轮播总张数：采样窗口要按它算，写死张数会在加图后悄悄失效。 */
const readCount = (page) =>
  page.evaluate(() => {
    const hero = document.querySelector('section')
    return hero ? hero.querySelectorAll('img').length : 0
  })

const browser = await chromium.launch({ channel: 'msedge' })

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 2,
    locale: 'zh-CN',
  })
  const page = await context.newPage()
  await page.goto(BASE, { waitUntil: 'networkidle' })

  const first = page.locator('section').first()
  const second = page.locator('section').nth(1)
  const firstBox = await first.boundingBox()
  const secondBox = await second.boundingBox()

  console.log(`\n[${vp.name}] 视口 ${vp.width}x${vp.height}`)
  console.log(`  第 1 屏（轮播）高度 ${Math.round(firstBox.height)}px`)
  console.log(`  第 2 屏（文案）起点 y=${Math.round(secondBox.y)}，高度 ${Math.round(secondBox.height)}px`)

  // 首屏视口（不滚动），确认轮播独占第一屏
  await page.screenshot({ path: `${OUT}/hero-首屏-${vp.name}.png` })
  // 前两屏，确认 banner 与下移后的文案的衔接
  await page.screenshot({
    path: `${OUT}/hero-前两屏-${vp.name}.png`,
    clip: { x: 0, y: 0, width: vp.width, height: Math.min(vp.topHeight, firstBox.height + secondBox.height) },
  })
  console.log(`  ✓ 已截图 hero-首屏-${vp.name}.png / hero-前两屏-${vp.name}.png`)

  if (vp.name === '桌面') {
    const total = await readCount(page)
    // 采样窗口必须盖满「张数 × 间隔」一整个循环，否则最后一张永远采不到、
    // 覆盖率看着像差一张（5 张时旧的 9 秒窗口就正好差这一张）。
    const windowMs = total * 2000 + 3000
    const start = Date.now()
    let last = null
    const changes = []
    while (Date.now() - start < windowMs) {
      const src = await readActive(page)
      if (src && src !== last) {
        changes.push({ src: src.split('/').pop(), at: Date.now() - start })
        last = src
      }
      await page.waitForTimeout(100)
    }
    const gaps = changes.slice(1).map((c, i) => c.at - changes[i].at)
    const avg = gaps.length ? Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length) : 0
    console.log(`  轮播：共切换 ${changes.length} 张，平均间隔 ${avg}ms，覆盖 ${new Set(changes.map((c) => c.src)).size}/${total} 张`)
  }

  await context.close()
}

await browser.close()
