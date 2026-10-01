import { EvidenceBadge } from '@/components/geo/EvidenceBadge'
import { requiresCompanyMarker, type EvidenceLevel } from '@/lib/content/evidence'

export interface KeyFactView {
  statement: string
  value?: string
  /** 该事实的来源等级；决定徽章颜色与是否需要核验标记 */
  evidenceLevel: EvidenceLevel
  /** 来源名称，展示在事实下方 */
  sourceTitle?: string
}

/**
 * 关键事实（需求文档 §30）。
 *
 * 每一条都带来源与证据等级徽章。Level 3 及以上额外内联一句核验提示——
 * 这是「所有医学/功效相关表述必须能够追溯到对应资料来源」在界面上的落地。
 */
export function KeyFacts({ facts }: { facts: readonly KeyFactView[] }) {
  if (facts.length === 0) return null

  return (
    <section aria-labelledby="key-facts">
      <h2 id="key-facts" className="text-[15px] font-bold tracking-tight text-ink-950">
        关键事实
      </h2>
      <dl className="mt-3 divide-y divide-sand-200 rounded-xl border border-sand-200 bg-white">
        {facts.map((fact) => (
          <div key={fact.statement} className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <dt className="flex-1 text-[14.5px] leading-relaxed text-sand-700">
                {fact.statement}
              </dt>
              {fact.value ? (
                <dd className="shrink-0 text-lg font-bold tabular-nums text-ink-800">
                  {fact.value}
                </dd>
              ) : null}
            </div>

            <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <EvidenceBadge level={fact.evidenceLevel} showLabel />
              {fact.sourceTitle ? (
                <span className="text-[12px] text-sand-500">来源：{fact.sourceTitle}</span>
              ) : null}
            </div>

            {requiresCompanyMarker(fact.evidenceLevel) ? (
              <p className="mt-2 text-[12px] text-caution-700">
                企业提供资料，未经过独立第三方核验，不能作为医学结论。
              </p>
            ) : null}
          </div>
        ))}
      </dl>
    </section>
  )
}
