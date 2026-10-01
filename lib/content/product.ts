import { loadMdxCollection } from './client'
import type { ProductKnowledge } from './schemas/product'
import { productKnowledgeSchema } from './schemas/product'
import { PRODUCT_SECTIONS, type ProductSection } from './taxonomy'

/**
 * 产品知识库（需求文档 §11）。
 *
 * 正文写在 MDX 里，结构化字段（尤其是数字与功效表述）写在 frontmatter 的 claims 中。
 * 正文不允许出现「没有登记来源的数字」——由 content:lint 强制。
 */

let cache: ProductKnowledge[] | null = null

export function getAllProductKnowledge(): ProductKnowledge[] {
  cache ??= loadMdxCollection('product-knowledge', productKnowledgeSchema, {
    // 正文是 Schema 的必填字段，但写在 MDX 正文而非 frontmatter 里，
    // 因此加载时注入后再校验。
    injectBody: true,
  })
    .map((file) => file.data)
    .sort((a, b) => a.order - b.order)
  return cache
}

export function getPublishedProductKnowledge(): ProductKnowledge[] {
  return getAllProductKnowledge().filter((p) => p.status === 'published')
}

export function getProductKnowledgeBySlug(slug: string): ProductKnowledge | undefined {
  return getPublishedProductKnowledge().find((p) => p.slug === slug)
}

export function getProductKnowledgeBySection(section: ProductSection): ProductKnowledge[] {
  return getPublishedProductKnowledge()
    .filter((p) => p.section === section)
    .sort((a, b) => a.order - b.order)
}

export function getProductKnowledgeBySlugs(slugs: readonly string[]): ProductKnowledge[] {
  const bySlug = new Map(getPublishedProductKnowledge().map((p) => [p.slug, p]))
  return slugs.map((slug) => bySlug.get(slug)).filter((p): p is ProductKnowledge => p !== undefined)
}

/**
 * 产品中心里「有内容的」分节。
 * 没有内容的页面不予展示，避免上线一批空页面被搜索引擎判为低质。
 */
export function getPopulatedProductSections(): (typeof PRODUCT_SECTIONS)[number][] {
  return PRODUCT_SECTIONS.filter(
    (section) => getProductKnowledgeBySection(section.slug).length > 0,
  )
}

export function getAllProductSlugs(): string[] {
  return getPublishedProductKnowledge().map((p) => p.slug)
}

export function __resetProductCache(): void {
  cache = null
}
