import type { Metadata } from 'next'

import { ArticleIndex } from '@/components/article/ArticleIndex'
import { getArticlesByCategory } from '@/lib/content'
import { HOME_CRUMB, SECTION_CRUMBS } from '@/lib/seo/breadcrumbs'
import { buildMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = buildMetadata({
  title: '睡眠基础',
  description:
    '了解睡眠本身：什么是睡眠周期、深度睡眠与 REM 睡眠有什么区别、成年人需要睡多久、生物钟是如何运作的。',
  path: '/sleep/basic',
  keywords: ['睡眠基础', '睡眠周期', '深度睡眠', 'REM睡眠', '浅睡眠', '生物钟'],
})

export default function SleepBasicPage() {
  return (
    <ArticleIndex
      title="睡眠基础"
      description="在讨论「怎么睡得更好」之前，先弄清楚睡眠本身是怎么运作的。"
      crumbs={[HOME_CRUMB, SECTION_CRUMBS.sleep, SECTION_CRUMBS.sleepBasic]}
      articles={getArticlesByCategory('sleep-basic')}
      activeCategory="sleep-basic"
    />
  )
}
