import type { Metadata } from 'next'

import { ArticleIndex } from '@/components/article/ArticleIndex'
import { getArticlesByCategory } from '@/lib/content'
import { HOME_CRUMB, SECTION_CRUMBS } from '@/lib/seo/breadcrumbs'
import { buildMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = buildMetadata({
  title: '睡眠改善',
  description:
    '可操作的睡眠改善方法：睡眠环境、作息规律、光照、运动、饮食与睡前活动，逐项说明怎么做以及为什么。',
  path: '/sleep/improvement',
  keywords: ['睡眠改善', '如何提高睡眠质量', '睡眠卫生', '作息调整', '睡前习惯'],
})

export default function SleepImprovementPage() {
  return (
    <ArticleIndex
      title="睡眠改善"
      description="睡眠习惯是可以调整的。这里列出的方法都有明确的做法与依据，不需要额外花钱。"
      crumbs={[HOME_CRUMB, SECTION_CRUMBS.sleep, SECTION_CRUMBS.sleepImprovement]}
      articles={getArticlesByCategory('sleep-improvement')}
      activeCategory="sleep-improvement"
    />
  )
}
