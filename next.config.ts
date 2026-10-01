import type { NextConfig } from 'next'

/**
 * 安全响应头。
 * 注意：Content-Security-Policy 需要按实际接入的统计域名（百度统计 / GA4 / Clarity）
 * 逐项放开，因此此处只给出保守的默认值，上线前必须按 M7 的实际统计配置复核。
 */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
]

/**
 * 演示/预览环境（如 Vercel 演示站）用 noindex 防止被搜索引擎收录。
 *
 * 刻意由环境变量控制，不在代码里写死演示行为：正式生产环境不设 SITE_NOINDEX，
 * 响应头与原先完全一致。同一份代码因此既能跑演示站又能跑正式站。
 *
 * 注意：noindex 必须配合「允许抓取」才生效——被 robots.txt 的 Disallow 挡住的页面，
 * 爬虫根本读不到这个响应头。所以 app/robots.ts 要保持 Allow，不要改成 Disallow。
 */
const siteHeaders =
  process.env.SITE_NOINDEX === '1'
    ? [...securityHeaders, { key: 'X-Robots-Tag', value: 'noindex, nofollow' }]
    : securityHeaders

const nextConfig: NextConfig = {
  // 独立产物，便于用 PM2 部署到国内 Node 服务器
  output: 'standalone',

  // canonical 一律不带尾斜杠；Next 会把带斜杠的形式 301 过来。
  // 绝不同时输出两种形式——这是百度 SEO 最常见的自我伤害。
  trailingSlash: false,

  /*
   * Next 16 已移除构建期内置的 ESLint 检查，代码检查统一由
   * `npm run lint` / `npm run verify` 负责，构建只负责产出。
   */
  poweredByHeader: false,
  reactStrictMode: true,

  images: {
    // 产品图片为本地静态资源，无需远端白名单
    formats: ['image/avif', 'image/webp'],
  },

  /**
   * 护栏规则与知识库语料是在**运行期**用 fs 读取的（路径是动态拼的），
   * Next 的文件追踪无法静态发现它们。若不加这段，standalone 产物会缺少
   * content/_guardrails 与 content/knowledge-base，
   * 结果是 AI 助手在服务器上启动即抛错——护栏缺失时必须拒绝启动，而不是无保护运行。
   */
  outputFileTracingIncludes: {
    '/api/ai/**': ['./content/_guardrails/**', './content/knowledge-base/**'],
    '/api/leads/**': ['./content/**'],
  },

  /** 客户原始资料不进入构建产物。 */
  outputFileTracingExcludes: {
    '/**': ['./产品资料/**', './产品图片/**', './网站首页轮播图片/**'],
  },

  async headers() {
    return [
      { source: '/:path*', headers: siteHeaders },
      {
        // 运行期数据目录绝不应被静态服务
        source: '/data/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ]
  },
}

export default nextConfig
