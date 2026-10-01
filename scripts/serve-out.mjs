#!/usr/bin/env node

/**
 * 静态产物预览服务器（服务 out/ 目录）。
 *
 * 为什么需要它：改成 `output: 'export'` 之后 `next start` 不再能服务站点
 * （它只认 server / standalone 产物），而 scripts/check-links.mjs 和几个截图脚本
 * 都依赖一个能跑起来的本地站点。默认端口 3200 与那些脚本的 BASE 保持一致。
 *
 * 它刻意模拟虚拟主机（nginx/tengine）的解析行为，这样本地验证过的结果对得上线上：
 *   · 目录索引：  /about/ → about/index.html
 *   · 补尾斜杠：  /about  → 301 到 /about/   （nginx 对目录的默认行为）
 *   · 未知路径：  返回 404.html
 *
 * 注意它**不执行 PHP**：/api/leads.php 只会被当普通文件返回。
 * 线索接口的行为要用真实 PHP 环境验证，见 deploy/README.md。
 */
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, join, normalize, resolve, sep } from 'node:path'

const ROOT = resolve(process.cwd(), 'out')
const PORT = Number(process.env.PORT ?? 3200)

const CONTENT_TYPES = {
  '.avif': 'image/avif',
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.webp': 'image/webp',
  '.xml': 'application/xml; charset=utf-8',
}

/** 返回文件信息；目录或不存在时返回 null。 */
async function asFile(path) {
  try {
    const info = await stat(path)
    return info.isFile() ? info : null
  } catch {
    return null
  }
}

function send(res, filePath, status = 200) {
  const type = CONTENT_TYPES[extname(filePath).toLowerCase()] ?? 'application/octet-stream'
  res.writeHead(status, { 'Content-Type': type })
  createReadStream(filePath).pipe(res)
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`)
  const pathname = decodeURIComponent(url.pathname)

  // 防目录穿越：解析之后必须仍在 out/ 之内
  const target = resolve(ROOT, `.${normalize(pathname)}`)
  if (target !== ROOT && !target.startsWith(ROOT + sep)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Forbidden')
    return
  }

  // 缺尾斜杠但对应目录存在 → 301 补齐，与 nginx 行为一致
  if (!pathname.endsWith('/') && (await asFile(join(target, 'index.html')))) {
    res.writeHead(301, { Location: `${pathname}/` })
    res.end()
    return
  }

  // 目录索引
  if (pathname.endsWith('/')) {
    const index = join(target, 'index.html')
    if (await asFile(index)) {
      send(res, index)
      return
    }
  }

  // 普通文件
  if (await asFile(target)) {
    send(res, target)
    return
  }

  // 404
  const notFound = join(ROOT, '404.html')
  if (await asFile(notFound)) {
    send(res, notFound, 404)
    return
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
  res.end('Not Found')
})

if (!(await asFile(join(ROOT, 'index.html')))) {
  console.error(`未找到 ${ROOT}/index.html —— 请先运行 npm run build 生成 out/。`)
  process.exit(1)
}

server.listen(PORT, () => {
  console.log(`静态产物预览：http://localhost:${PORT}`)
  console.log(`根目录：${ROOT}`)
})
