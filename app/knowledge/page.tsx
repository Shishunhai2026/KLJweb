import type { Metadata } from 'next'

import { ArticleIndex } from '@/components/article/ArticleIndex'
import { getPublishedArticles } from '@/lib/content'
import { HOME_CRUMB, SECTION_CRUMBS } from '@/lib/seo/breadcrumbs'
import { buildMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = buildMetadata({
  title: '睡眠知识库',
  description:
    '按主题整理的睡眠知识：从睡眠周期、深度睡眠等基础概念，到入睡困难、夜间易醒等常见问题的解答，以及可操作的改善方法。',
  path: '/knowledge',
  keywords: ['睡眠知识', '睡眠知识库', '睡眠科普', '睡眠周期', '如何提高睡眠质量'],
})

export default function KnowledgeIndexPage() {
  const articles = getPublishedArticles()

  return (
    <ArticleIndex
      title="睡眠知识库"
      description="从基础概念到具体问题，按主题整理的睡眠知识。每篇文章都标注了资料来源与更新时间。"
      crumbs={[HOME_CRUMB, SECTION_CRUMBS.knowledge]}
      articles={articles}
      emptyHint="知识库内容正在陆续上线。您也可以先做一次睡眠自测，或从睡眠问题专题开始浏览。"
    />
  )
}
