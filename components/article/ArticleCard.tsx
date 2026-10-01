import Link from 'next/link'

import type { LoadedArticle } from '@/lib/content'
import { getArticleCategory } from '@/lib/content/taxonomy'
import { articlePath } from '@/lib/seo/routes'
import { Badge } from '@/components/ui/Badge'

/** 文章列表卡片。列表页与首页共用。 */
export function ArticleCard({ article }: { article: LoadedArticle }) {
  const category = getArticleCategory(article.category)

  return (
    <Link
      href={articlePath(article.slug)}
      className="group flex h-full flex-col rounded-card border border-sand-200 bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-ink-200 hover:shadow-card-hover"
    >
      <Badge tone="ink">{category.label}</Badge>

      <h3 className="mt-3 text-[15.5px] font-bold leading-snug text-ink-950 group-hover:text-ink-800">
        {article.title}
      </h3>

      <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-sand-600">
        {article.summary}
      </p>

      <time
        dateTime={article.updatedAt}
        className="mt-4 text-[12px] text-sand-400"
      >
        更新于 {article.updatedAt}
      </time>
    </Link>
  )
}
