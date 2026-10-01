import type { Metadata } from 'next'

import type { RobotsDirective } from '../content/schemas/common'
import { absoluteUrl, SITE } from './site'

/**
 * 统一的 metadata 构造器。
 *
 * 需求文档 §38 要求每个页面都必须拥有 title / description / canonical /
 * og:title / og:description / og:image / robots。
 * 让所有路由都走这一个函数，是保证「没有哪个页面漏掉某一项」的唯一可靠办法。
 */

export interface MetadataInput {
  /** 不含品牌后缀的页面标题；根布局的 title.template 会自动补上「| 和颐林·睡眠大师」 */
  title: string
  description: string
  /** 站内路径，如 /sleep/problems/night-awakening */
  path: string
  robots?: RobotsDirective
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  authors?: string[]
  keywords?: readonly string[]
  image?: string
  /** 设为 true 时不套用标题模板（用于首页） */
  absoluteTitle?: boolean
}

const ROBOTS_MAP: Record<RobotsDirective, Metadata['robots']> = {
  'index,follow': { index: true, follow: true },
  'noindex,follow': { index: false, follow: true },
  'noindex,nofollow': { index: false, follow: false },
}

export function buildMetadata(input: MetadataInput): Metadata {
  const url = absoluteUrl(input.path)
  const image = absoluteUrl(input.image ?? SITE.defaultOgImage)
  const robots = ROBOTS_MAP[input.robots ?? 'index,follow']

  /*
   * 标题的两种模式：
   *  - 普通页面：只给页面自己的标题，由根布局的 title.template 统一追加「｜和颐林·睡眠大师」。
   *  - absoluteTitle：标题已经自带品牌名（首页、404 等），必须原样使用，
   *    否则会被模板再拼一次，出现「品牌｜栏目｜品牌」的重复。
   * 之前这里把两种模式写反了，导致首页标题里品牌名出现两次。
   */
  const title = input.absoluteTitle ? { absolute: input.title } : input.title

  // 社交分享没有 title.template 的拼接，需要在这里显式补上品牌名
  const resolvedTitle = input.absoluteTitle ? input.title : `${input.title}｜${SITE.name}`

  return {
    title,
    description: input.description,
    keywords: input.keywords ? [...input.keywords] : undefined,

    alternates: {
      canonical: url,
      // 站点仅中文。x-default 指向同一地址，避免爬虫猜测语言版本。
      // V1 不做 /en：机翻的医学邻域内容会引入第二套更严的合规面。
      languages: {
        'zh-CN': url,
        'x-default': url,
      },
    },

    robots,

    openGraph: {
      type: input.type ?? 'website',
      siteName: SITE.name,
      locale: 'zh_CN',
      title: resolvedTitle,
      description: input.description,
      url,
      images: [{ url: image, width: 1200, height: 630, alt: resolvedTitle }],
      ...(input.type === 'article'
        ? {
            publishedTime: input.publishedTime,
            modifiedTime: input.modifiedTime,
            authors: input.authors,
          }
        : {}),
    },

    twitter: {
      card: 'summary_large_image',
      title: input.title,
      description: input.description,
      images: [image],
    },
  }
}

/** 明确要求不被收录的页面（后台、搜索结果页等）。 */
export function buildNoIndexMetadata(input: Omit<MetadataInput, 'robots'>): Metadata {
  return buildMetadata({ ...input, robots: 'noindex,nofollow' })
}
