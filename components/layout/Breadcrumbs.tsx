import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

import { JsonLd } from '@/components/seo/JsonLd'
import type { Crumb } from '@/lib/seo/breadcrumbs'
import { buildBreadcrumbLd } from '@/lib/seo/jsonld'

/**
 * 面包屑。
 *
 * 可见的面包屑与 BreadcrumbList 结构化数据由**同一个数组**渲染，
 * 因此两者不可能不一致——这是需求文档 §38 里最容易被实现成两套的地方。
 */
export function Breadcrumbs({ crumbs, className }: { crumbs: readonly Crumb[]; className?: string }) {
  if (crumbs.length < 2) return null

  return (
    <>
      <JsonLd data={buildBreadcrumbLd(crumbs)} />
      <nav aria-label="面包屑" className={className}>
        <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px]">
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1
            return (
              <li key={crumb.path} className="flex items-center gap-x-1.5">
                {isLast ? (
                  <span className="text-sand-500" aria-current="page">
                    {crumb.name}
                  </span>
                ) : (
                  <>
                    <Link
                      href={crumb.path}
                      className="text-sand-500 transition-colors hover:text-ink-700"
                    >
                      {crumb.name}
                    </Link>
                    <ChevronRight className="size-3.5 text-sand-300" aria-hidden="true" />
                  </>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}
