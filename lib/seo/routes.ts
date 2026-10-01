/**
 * 站点静态路由清单。
 *
 * sitemap 与 seo:audit 共用这一份清单，
 * 保证「sitemap 里有的」和「审计会去爬的」永远一致。
 *
 * 只登记**路径固定、必然存在**的页面。由内容数量决定的页面
 * （文章、睡眠问题专题、产品分节）不在这里——它们的 URL 取决于内容里有什么，
 * 追加在 app/sitemap.ts 中，以免这份清单与内容脱节。
 */

export interface StaticRoute {
  path: string
  /** 页面标题，仅用于日志与审计输出 */
  title: string
  /** 优先级提示，写入 sitemap */
  priority: number
  changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
}

export const STATIC_ROUTES: readonly StaticRoute[] = [
  { path: '/', title: '首页', priority: 1.0, changeFrequency: 'weekly' },

  { path: '/sleep', title: '认识睡眠', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/sleep/basic', title: '睡眠基础', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/sleep/problems', title: '睡眠问题', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/sleep/improvement', title: '睡眠改善', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/sleep/nutrition', title: '睡眠营养', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/sleep/self-test', title: '睡眠自测', priority: 1.0, changeFrequency: 'monthly' },

  { path: '/knowledge', title: '睡眠知识库', priority: 0.9, changeFrequency: 'daily' },

  /*
   * 产品分节（/product/*）刻意**不在这里登记**。
   * 只有「有已发布内容的分节」才会生成页面，写死在这里必然与内容脱节——
   * 曾经就因此让 sitemap 收录了 5 个 404 的 /product/* 地址。
   * 它们由 app/sitemap.ts 从 getPopulatedProductSections() 派生。
   */
  { path: '/product', title: '产品中心', priority: 0.9, changeFrequency: 'monthly' },

  { path: '/testimonials', title: '用户反馈', priority: 0.6, changeFrequency: 'monthly' },

  { path: '/about', title: '关于我们', priority: 0.5, changeFrequency: 'yearly' },
  { path: '/contact', title: '联系我们', priority: 0.5, changeFrequency: 'yearly' },
  { path: '/privacy', title: '隐私政策', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/terms', title: '用户协议', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/medical-disclaimer', title: '健康免责声明', priority: 0.4, changeFrequency: 'yearly' },
]

/** 文章详情页路径。 */
export function articlePath(slug: string): string {
  return `/knowledge/${slug}`
}

/** 睡眠问题专题页路径。 */
export function problemPath(slug: string): string {
  return `/sleep/problems/${slug}`
}

/** 产品资料详情页路径。 */
export function productKnowledgePath(section: string, slug: string): string {
  return `/product/${section}/${slug}`
}
