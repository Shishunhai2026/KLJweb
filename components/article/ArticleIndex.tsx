import Link from 'next/link'

import { ArticleCard } from '@/components/article/ArticleCard'
import { Container } from '@/components/layout/Container'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { ButtonLink } from '@/components/ui/Button'
import type { LoadedArticle } from '@/lib/content'
import { ARTICLE_CATEGORIES, type ArticleCategory } from '@/lib/content/taxonomy'
import type { Crumb } from '@/lib/seo/breadcrumbs'
import { PRIMARY_CTA } from '@/lib/nav'

/**
 * 文章列表页的共用骨架。
 *
 * 各个栏目页（睡眠基础 / 睡眠改善 / 睡眠营养 / 知识库）只有标题与筛选范围不同，
 * 版式完全一致，因此抽成一个组件——避免四份几乎相同的页面各自漂移。
 * 选中分类时展示分类导航，让用户在栏目之间横向流转。
 */
export function ArticleIndex({
  title,
  description,
  crumbs,
  articles,
  activeCategory,
  emptyHint,
}: {
  title: string
  description: string
  crumbs: Crumb[]
  articles: LoadedArticle[]
  activeCategory?: ArticleCategory
  emptyHint?: string
}) {
  return (
    <>
      <div className="border-b border-sand-200 bg-white">
        <Container size="wide" className="py-8">
          <Breadcrumbs crumbs={crumbs} />
          <h1 className="mt-5 text-[1.75rem] font-bold leading-tight tracking-tight text-ink-950 sm:text-[2rem]">
            {title}
          </h1>
          <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-sand-600">{description}</p>
        </Container>
      </div>

      <Container size="wide" className="py-10">
        <nav aria-label="文章分类" className="mb-8 flex flex-wrap gap-2">
          <CategoryChip href="/knowledge" label="全部" active={!activeCategory} />
          {ARTICLE_CATEGORIES.map((category) => (
            <CategoryChip
              key={category.slug}
              href={category.path}
              label={category.label}
              active={activeCategory === category.slug}
            />
          ))}
        </nav>

        {articles.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <li key={article.slug}>
                <ArticleCard article={article} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-card border border-dashed border-sand-300 bg-white p-10 text-center">
            <p className="text-[14.5px] text-sand-600">
              {emptyHint ?? '这个栏目下的内容正在整理中，敬请期待。'}
            </p>
            <ButtonLink href={PRIMARY_CTA.href} className="mt-5">
              {PRIMARY_CTA.label}
            </ButtonLink>
          </div>
        )}
      </Container>
    </>
  )
}

function CategoryChip({
  href,
  label,
  active,
}: {
  href: string
  label: string
  active: boolean
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={
        active
          ? 'inline-flex rounded-full bg-ink-900 px-3.5 py-1.5 text-[13px] font-medium text-white'
          : 'inline-flex rounded-full border border-sand-300 bg-white px-3.5 py-1.5 text-[13px] text-sand-700 transition-colors hover:border-ink-300 hover:text-ink-800'
      }
    >
      {label}
    </Link>
  )
}
