/**
 * 裁切检查（开发期预览用，不属于交付产物）。
 * 在各种视口下量出轮播图被 object-cover 裁掉了多少，并各截一张图。
 *
 * 用法：node scripts/_check-crop.mjs [baseUrl]
 */
import { chromium } from 'playwright'

const BASE = process.argv[2] ?? 'http://localhost:3200'
const OUT = 'D:/客户/website/.preview'

const VIEWPORTS = [
  { width: 1440, height: 900, name: '1440x900' },
  { width: 1440, height: 1100, name: '1440x1100-高窗口' },
  { width: 1920, height: 1080, name: '1920x1080' },
  { width: 1280, height: 800, name: '1280x800' },
  { width: 390, height: 844, name: '390x844-移动' },
]

/** 量出当前显示的轮播图被裁掉的比例。 */
const measure = (page) =>
  page.evaluate(() => {
    const hero = document.querySelector('section')
    const img = [...hero.querySelectorAll('img')].find(
      (i) => getComputedStyle(i).opacity === '1',
    )
    if (!img) return null
    const box = img.getBoundingClientRect()
    const scale = Math.max(box.width / img.naturalWidth, box.height / img.naturalHeight)
    const drawnW = img.naturalWidth * scale
    const drawnH = img.naturalHeight * scale
    return {
      cropX: 1 - box.width / drawnW,
      cropY: 1 - box.height / drawnH,
      natural: `${img.naturalWidth}x${img.naturalHeight}`,
      rendered: `${Math.round(box.width)}x${Math.round(box.height)}`,
    }
  })

const browser = await chromium.launch({ channel: 'msedge' })

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    locale: 'zh-CN',
  })
  const page = await context.newPage()
  await page.goto(BASE, { waitUntil: 'networkidle' })

  const m = await measure(page)
  const fmt = (v) => `${(v * 100).toFixed(1)}%`
  console.log(
    `${vp.name.padEnd(20)} 原图 ${m.natural}  渲染 ${m.rendered}  横向裁 ${fmt(m.cropX)}  纵向裁 ${fmt(m.cropY)}`,
  )

  await page.locator('section').first().screenshot({ path: `${OUT}/crop-${vp.name}.png` })
  await context.close()
}

await browser.close()
