import type { MetadataRoute } from 'next'

import {
  getPopulatedProductSections,
  getPublishedArticles,
  getPublishedProblems,
} from '@/lib/content'
import { articlePath, problemPath, STATIC_ROUTES } from '@/lib/seo/routes'
import { absoluteUrl } from '@/lib/seo/site'

/**
 * sitemap.xml
 *
 * 关于 lastModified：**只使用内容里真实的更新时间**。
 * 绝不能写 Date.now()——一个每次请求都在变的 lastmod 会让爬虫
 * 学会彻底忽略这个字段，等于白写。
 * 也因此静态页面不设 lastModified，而不是编一个。
 *
 * 只收录已发布内容；草稿与被标记 noindex 的页面一律排除。
 */
export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = []

  for (const route of STATIC_ROUTES) {
    entries.push({
      url: absoluteUrl(route.path),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })
  }

  for (const article of getPublishedArticles()) {
    entries.push({
      url: absoluteUrl(articlePath(article.slug)),
      lastModified: article.updatedAt,
      changeFrequency: 'monthly',
      priority: article.featured ? 0.9 : 0.7,
    })
  }

  for (const problem of getPublishedProblems()) {
    entries.push({
      url: absoluteUrl(problemPath(problem.slug)),
      lastModified: problem.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.8,
    })
  }

  /*
   * 产品分节的 URL 从内容派生，不写死在 STATIC_ROUTES 里。
   *
   * 写死过一次，结果是清单比内容跑得快：sitemap 收录了 5 个没有对应页面的
   * /product/* 地址（sod、four-enzyme、process、patents、research），抓取全是 404。
   * 这里复用产品页自己在 generateStaticParams 里用的 getPopulatedProductSections()，
   * 两边判据同源，不会再出现「sitemap 有、页面没有」的漂移。
   *
   * 产品资料条目本身不单独成页——它们渲染在各自的栏目页内，
   * 避免产生大量内容单薄的页面。
   */
  for (const section of getPopulatedProductSections()) {
    // 产品首页（basic 分节）的路径就是 /product，已由 STATIC_ROUTES 收录
    if (section.path === '/product') continue
    entries.push({
      url: absoluteUrl(section.path),
      changeFrequency: 'monthly',
      priority: 0.7,
    })
  }

  return entries
}
