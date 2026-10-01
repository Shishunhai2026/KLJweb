import type { Metadata } from 'next'

import { ArticleIndex } from '@/components/article/ArticleIndex'
import { getArticlesByCategory } from '@/lib/content'
import { HOME_CRUMB, SECTION_CRUMBS } from '@/lib/seo/breadcrumbs'
import { buildMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = buildMetadata({
  title: '睡眠营养',
  description:
    '营养与睡眠的关系：SOD、茶氨酸、GABA、硒等营养素的作用机制，以及如何判断一项营养研究是否可靠。',
  path: '/sleep/nutrition',
  keywords: ['睡眠营养', 'SOD与睡眠', '茶氨酸', 'GABA', '硒', '褪黑素', '睡眠与营养'],
})

export default function SleepNutritionPage() {
  return (
    <ArticleIndex
      title="睡眠营养"
      description="营养与睡眠的关系值得了解，但也最容易被夸大。这里同时说明「研究说了什么」和「研究不能说明什么」。"
      crumbs={[HOME_CRUMB, SECTION_CRUMBS.sleep, SECTION_CRUMBS.sleepNutrition]}
      articles={getArticlesByCategory('sleep-nutrition')}
      activeCategory="sleep-nutrition"
    />
  )
}
