import type {
  Article as SchemaArticle,
  BreadcrumbList,
  FAQPage,
  MedicalWebPage,
  Organization,
  Person,
  Product,
  WebSite,
  WithContext,
} from 'schema-dts'

import type { FaqItem, SourceRef } from '../content/schemas/common'
import { EVIDENCE } from '../content/evidence'
import type { Crumb } from './breadcrumbs'
import { absoluteUrl, SITE, SITE_ORIGIN } from './site'

/**
 * JSON-LD 结构化数据构造器（需求文档 §38）。
 *
 * 全部用 schema-dts 做类型约束，避免拼错字段名——
 * 结构化数据的错误不会在页面上体现，只会静默地让搜索特性失效。
 */

const ORG_ID = `${SITE_ORIGIN}/#organization`
const SITE_ID = `${SITE_ORIGIN}/#website`

// ---------------------------------------------------------------------------
// 站点级
// ---------------------------------------------------------------------------

/**
 * 站点级 Organization。
 *
 * 这里描述的是**网站的运营方**——也就是 ICP 备案主体（长沙康龄纪），
 * 而不是品牌所有方。产品页的 manufacturer 另有指向，两者不混用。
 */
export function buildOrganizationLd(): WithContext<Organization> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE.name,
    legalName: SITE.operator.legalName,
    url: SITE_ORIGIN,
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl('/brand/logo.png'),
    },
    description: SITE.description,
    ...(SITE.operator.telephone ? { telephone: SITE.operator.telephone } : {}),
    ...(SITE.operator.email ? { email: SITE.operator.email } : {}),
    // 品牌归属单独标注，避免与运营主体混淆
    brand: { '@type': 'Brand', name: SITE.name },
    parentOrganization: {
      '@type': 'Organization',
      name: SITE.brandOwner.legalName,
      foundingDate: String(SITE.brandOwner.foundingYear),
    },
  }
}

export function buildWebSiteLd(): WithContext<WebSite> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': SITE_ID,
    name: SITE.name,
    alternateName: SITE.shortName,
    url: SITE_ORIGIN,
    description: SITE.description,
    inLanguage: SITE.lang,
    publisher: { '@id': ORG_ID },
    /*
     * 刻意不声明 potentialAction（SearchAction）。
     * 站内搜索在 V1 尚未提供，声明一个指向不存在功能的搜索入口，
     * 对搜索引擎而言是无效标记，对用户则是承诺了做不到的事。
     * P1 上线站内搜索后再补上。
     */
  }
}

// ---------------------------------------------------------------------------
// 面包屑
// ---------------------------------------------------------------------------

export function buildBreadcrumbLd(crumbs: readonly Crumb[]): WithContext<BreadcrumbList> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem' as const,
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  }
}

// ---------------------------------------------------------------------------
// 文章
// ---------------------------------------------------------------------------

export interface ArticleLdInput {
  headline: string
  description: string
  path: string
  publishedTime: string
  modifiedTime: string
  reviewedTime?: string
  authorName: string
  reviewerName?: string
  image?: string
  keywords?: readonly string[]
  articleSection?: string
  /** 引用的资料，会转成 citation 字段 */
  sources?: readonly SourceRef[]
}

export function buildArticleLd(input: ArticleLdInput): WithContext<SchemaArticle> {
  const url = absoluteUrl(input.path)

  const author: Person = {
    '@type': 'Person',
    name: input.authorName,
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.headline,
    description: input.description,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
    datePublished: input.publishedTime,
    dateModified: input.modifiedTime,
    inLanguage: SITE.lang,
    author,
    /*
     * 审核人何时审的。与 reviewedBy 成对出现——只署名「谁审的」而不说「何时审的」，
     * 等于把审核信息的时效性留空（需求文档 §30 要求页面给出更新时间与作者/审核）。
     *
     * schema.org 把 lastReviewed 归在 WebPage 名下，Article 严格来说没有这个属性。
     * 这里与 reviewedBy 一并挂在 Article 节点上，是搜索引擎普遍接受的写法。
     * 也正因为是展开写法，excess property check 不生效——类型系统拦不住这里的字段名写错，
     * 所以 tests/unit/jsonld.test.ts 里对这两个字段做了断言。
     */
    ...(input.reviewedTime ? { lastReviewed: input.reviewedTime } : {}),
    ...(input.reviewerName
      ? { reviewedBy: { '@type': 'Person', name: input.reviewerName } as Person }
      : {}),
    publisher: { '@id': ORG_ID },
    isPartOf: { '@id': SITE_ID },
    ...(input.image ? { image: [absoluteUrl(input.image)] } : {}),
    ...(input.keywords && input.keywords.length > 0 ? { keywords: [...input.keywords] } : {}),
    ...(input.articleSection ? { articleSection: input.articleSection } : {}),
    ...(input.sources && input.sources.length > 0
      ? {
          citation: input.sources.map((source) =>
            [
              source.authors?.join('、'),
              source.title,
              source.publisher,
              source.year ? String(source.year) : undefined,
            ]
              .filter(Boolean)
              .join('. '),
          ),
        }
      : {}),
  }
}

// ---------------------------------------------------------------------------
// FAQ
// ---------------------------------------------------------------------------

/**
 * FAQPage 结构化数据。
 *
 * 少于 2 条时返回 null —— 空的 FAQ 标记会被 Google 判为无效标记并可能触发人工处罚，
 * 宁可不输出。
 */
export function buildFaqPageLd(faq: readonly FaqItem[]): WithContext<FAQPage> | null {
  if (faq.length < 2) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question' as const,
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer' as const,
        text: item.answer,
      },
    })),
  }
}

// ---------------------------------------------------------------------------
// 医学/健康页面
// ---------------------------------------------------------------------------

export interface MedicalWebPageLdInput {
  name: string
  description: string
  path: string
  modifiedTime: string
  reviewedTime?: string
  reviewerName?: string
  keywords?: readonly string[]
}

export function buildMedicalWebPageLd(
  input: MedicalWebPageLdInput,
): WithContext<MedicalWebPage> {
  const url = absoluteUrl(input.path)

  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: input.name,
    description: input.description,
    url,
    inLanguage: SITE.lang,
    dateModified: input.modifiedTime,
    ...(input.reviewedTime ? { lastReviewed: input.reviewedTime } : {}),
    ...(input.reviewerName
      ? { reviewedBy: { '@type': 'Person', name: input.reviewerName } as Person }
      : {}),
    ...(input.keywords && input.keywords.length > 0 ? { keywords: [...input.keywords] } : {}),
    publisher: { '@id': ORG_ID },
    /*
     * 医学免责：明确声明本页不是医疗建议。
     * 这既是合规要求，也能帮助搜索引擎正确理解页面性质。
     */
    audience: { '@type': 'PeopleAudience', audienceType: '一般公众' },
  }
}

// ---------------------------------------------------------------------------
// 产品
// ---------------------------------------------------------------------------

export interface ProductLdInput {
  name: string
  description: string
  path: string
  image?: string
  category?: string
  /** 品牌名 */
  brand?: string
}

/**
 * 产品结构化数据。
 *
 * ⚠️ 刻意**不输出 offers / 价格 / 评分**：
 *    - V1 没有在线购买流程，杜撰价格属于虚假信息；
 *    - 本产品为特殊膳食，没有真实的用户评分体系，编造 aggregateRating
 *      是 Google 明确禁止的行为，会导致富媒体结果被取消。
 * 待 P1 上线真实购买流程后再补 offers。
 */
export function buildProductLd(input: ProductLdInput): WithContext<Product> {
  const url = absoluteUrl(input.path)

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: input.name,
    description: input.description,
    url,
    ...(input.image ? { image: [absoluteUrl(input.image)] } : {}),
    ...(input.category ? { category: input.category } : {}),
    brand: {
      '@type': 'Brand',
      name: input.brand ?? SITE.name,
    },
    /*
     * manufacturer 指向**品牌所有方**（北京和颐林），不是站点运营方。
     * 品牌方负责研发生产，运营方负责网站与销售，两者是不同法律主体——
     * 在产品结构化数据里混用会造成主体错位。
     */
    manufacturer: {
      '@type': 'Organization',
      name: SITE.brandOwner.legalName,
    },
  }
}

// ---------------------------------------------------------------------------
// 辅助
// ---------------------------------------------------------------------------

/**
 * 依据引用资料的证据等级，生成一句面向读者与 AI 的说明。
 * 让「这些数据是什么来路」在结构化数据层面也是显式的。
 */
export function describeEvidence(levels: readonly number[]): string {
  if (levels.length === 0) return ''
  const unique = [...new Set(levels)].sort((a, b) => a - b)
  return unique
    .map((level) => {
      const definition = EVIDENCE[level as keyof typeof EVIDENCE]
      return definition ? `${definition.short} ${definition.label}` : ''
    })
    .filter(Boolean)
    .join('；')
}
