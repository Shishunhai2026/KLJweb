/**
 * 站内链接检查。
 *
 * 爬取构建产物中的所有站内链接，报告 404 与重定向。
 * 死链既伤害用户体验，也会让搜索引擎降低整站评分——
 * 这类问题必须在上线前清零。
 *
 * 用法：node scripts/check-links.mjs [baseUrl]
 */
import { chromium } from 'playwright'

const BASE = process.argv[2] ?? 'http://localhost:3200'
const MAX_PAGES = 200

const browser = await chromium.launch({ channel: 'msedge' })
const page = await browser.newPage()

const seen = new Set()
const queue = ['/']
const broken = []
const redirects = []
const checked = new Map()

function normalize(href) {
  try {
    const url = new URL(href, BASE)
    if (url.origin !== new URL(BASE).origin) return null // 外链跳过
    let path = url.pathname
    if (path.length > 1) path = path.replace(/\/+$/, '')
    return path
  } catch {
    return null
  }
}

while (queue.length > 0 && seen.size < MAX_PAGES) {
  const path = queue.shift()
  if (seen.has(path)) continue
  seen.add(path)

  let response
  try {
    response = await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 20000 })
  } catch {
    // 页面打不开（超时、连接被拒等）同样视为死链
    broken.push({ path, status: 'ERR' })
    continue
  }

  const status = response?.status() ?? 0
  checked.set(path, [])

  if (status >= 400) {
    broken.push({ path, status, from: '—' })
    continue
  }
  if (status >= 300 && status < 400) {
    redirects.push({ path, status, to: response.headers()['location'] })
  }

  // 收集本页所有站内链接
  const hrefs = await page.$$eval('a[href]', (as) => as.map((a) => a.getAttribute('href')))
  for (const href of hrefs) {
    const normalized = normalize(href)
    if (normalized && !seen.has(normalized)) queue.push(normalized)
  }
}

await browser.close()

console.log(`\n已检查 ${seen.size} 个页面\n`)

if (redirects.length > 0) {
  console.log(`重定向 ${redirects.length} 个：`)
  for (const r of redirects) console.log(`  ${r.status} ${r.path} → ${r.to}`)
  console.log('')
}

if (broken.length > 0) {
  console.log(`✗ 死链 ${broken.length} 个：`)
  for (const b of broken) console.log(`  [${b.status}] ${b.path}`)
  process.exit(1)
} else {
  console.log('✓ 未发现死链')
}
