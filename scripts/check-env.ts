/**
 * 构建期环境变量守卫。
 *
 * 为什么需要它：本项目是静态导出，origin 会被**烘进每一页 HTML**
 * （canonical / sitemap.xml / robots.txt / JSON-LD），构建完成后无法再修正——
 * 改环境变量重新构建是唯一的补救方式，而那时错误地址可能已经被搜索引擎抓走了。
 *
 * 而 lib/seo/site.ts 在变量缺失时**只打一条 console.warn 然后降级为 localhost:3000**。
 * 也就是说：漏配环境变量不会让构建失败，只会让整站 33 页的 canonical 静默指向 localhost。
 * 这个守卫把「静默出错」变成「构建失败」。
 *
 * 挂在 package.json 的 prebuild 上，所以本地构建和 CI 都会经过它。
 */

// tsx 直接跑脚本时**不会**自动加载 .env（那是 next build 的行为）。
// 不显式加载的话，守卫会误杀正确的本地构建，而「修法」通常是把它关掉——
// 那样守卫就白写了。
for (const file of ['.env', '.env.local']) {
  try {
    process.loadEnvFile(file)
  } catch {
    // 文件不存在是正常的：CI / 构建服务器上的变量来自环境
  }
}

const errors: string[] = []
const warnings: string[] = []

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()

if (!rawSiteUrl) {
  errors.push(
    'NEXT_PUBLIC_SITE_URL 未设置。构建会把 localhost:3000 写进全站 canonical / sitemap / robots。',
  )
} else {
  let parsed: URL | undefined
  try {
    parsed = new URL(rawSiteUrl)
  } catch {
    errors.push(`NEXT_PUBLIC_SITE_URL 不是合法的绝对地址：「${rawSiteUrl}」`)
  }

  if (parsed) {
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      errors.push(`NEXT_PUBLIC_SITE_URL 必须是 http 或 https：「${rawSiteUrl}」`)
    }

    // 站点部署在域名根目录。带路径会把 absoluteUrl 拼出错误地址。
    if (parsed.pathname !== '/') {
      errors.push(
        `NEXT_PUBLIC_SITE_URL 不应带路径，应为纯 origin（如 https://www.example.com）：「${rawSiteUrl}」`,
      )
    }

    if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
      errors.push(
        `NEXT_PUBLIC_SITE_URL 指向本机（${parsed.hostname}）——这是占位值，不能用于要发布出去的构建。`,
      )
    }

    if (parsed.protocol === 'http:' && parsed.hostname !== 'localhost') {
      warnings.push(
        `NEXT_PUBLIC_SITE_URL 用的是 http：「${rawSiteUrl}」。正式站应使用 https，否则 canonical 与站点实际协议不符。`,
      )
    }
  }

  if (rawSiteUrl.endsWith('/')) {
    // 代码会剥掉尾斜杠，所以不致命；但写出来说明配的人不清楚约定，值得提一句。
    warnings.push(`NEXT_PUBLIC_SITE_URL 带了尾斜杠：「${rawSiteUrl}」（代码会自动剥掉，建议直接写不带斜杠的形式）`)
  }
}

if (!process.env.NEXT_PUBLIC_ICP?.trim()) {
  errors.push('NEXT_PUBLIC_ICP 未设置。页脚备案号是大陆上线必须展示的合规信息。')
}

for (const warning of warnings) {
  console.warn(`[env:check] 警告：${warning}`)
}

if (errors.length > 0) {
  console.error('\n[env:check] 构建已被拦截，以下环境变量有问题：\n')
  for (const error of errors) {
    console.error(`  ✖ ${error}`)
  }
  console.error(
    '\n本地请在 .env 中配置；构建服务器请在平台的环境变量里配置。' +
      '改完再重新构建——静态站的地址是烘在 HTML 里的，构建后无法修补。\n',
  )
  process.exit(1)
}

console.info('[env:check] 环境变量检查通过')
