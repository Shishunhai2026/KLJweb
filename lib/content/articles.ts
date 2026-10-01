import { loadMdxCollection } from './client'
import type { Article } from './schemas/article'
import { articleSchema } from './schemas/article'
import type { ArticleCategory } from './taxonomy'

/**
 * 文章集合。
 *
 * 加载即校验：任何一篇 frontmatter 不合法都会让构建失败，
 * 而不是产出一个「看起来正常但缺字段」的页面。
 */

export interface LoadedArticle extends Article {
  /** MDX 正文 */
  body: string
}

let cache: LoadedArticle[] | null = null

/** 全部文章（含草稿）。仅构建脚本与站内链接校验使用。 */
export function getAllArticles(): LoadedArticle[] {
  cache ??= loadMdxCollection('articles', articleSchema)
    .map((file) => ({ ...file.data, body: file.body }))
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
  return cache
}

/** 已发布文章。页面渲染一律用这个。 */
export function getPublishedArticles(): LoadedArticle[] {
  return getAllArticles().filter((a) => a.status === 'published')
}

export function getArticleBySlug(slug: string): LoadedArticle | undefined {
  return getPublishedArticles().find((a) => a.slug === slug)
}

export function getArticlesByCategory(category: ArticleCategory): LoadedArticle[] {
  return getPublishedArticles().filter((a) => a.category === category)
}

/**
 * 按睡眠问题专题取文章。
 * 参数是**专题的 slug**（如 night-awakening），不是 taxonomy 里的分类。
 * 两者命名相近但语义不同：分类描述「问题类型」，slug 标识「专题页面」。
 */
export function getArticlesByProblem(problemSlug: string): LoadedArticle[] {
  return getPublishedArticles().filter((a) => a.problemSlug === problemSlug)
}

/** 按给定顺序取文章，跳过不存在的 slug。用于渲染「相关阅读」。 */
export function getArticlesBySlugs(slugs: readonly string[]): LoadedArticle[] {
  const bySlug = new Map(getPublishedArticles().map((a) => [a.slug, a]))
  return slugs.map((slug) => bySlug.get(slug)).filter((a): a is LoadedArticle => a !== undefined)
}

export function getAllArticleSlugs(): string[] {
  return getPublishedArticles().map((a) => a.slug)
}

/** 首页等处的精选文章。 */
export function getFeaturedArticles(limit = 6): LoadedArticle[] {
  const featured = getPublishedArticles().filter((a) => a.featured)
  return (featured.length > 0 ? featured : getPublishedArticles()).slice(0, limit)
}

/** 仅测试用：清空模块级缓存。 */
export function __resetArticleCache(): void {
  cache = null
}
