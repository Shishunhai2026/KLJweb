import { EvidenceBadge } from '@/components/geo/EvidenceBadge'
import { COMPANY_SUPPLIED_MARKER, EVIDENCE } from '@/lib/content/evidence'
import type { SourceRef } from '@/lib/content/schemas/common'

/**
 * 资料来源清单（需求文档 §30、§31）。
 *
 * 每一项都完整展示「是什么资料、谁出的、哪一年、什么证据等级、核验状态如何」。
 * 资料自身带的使用限制（如「报告内容不得用于商业广告」）也一并展示——
 * 这是需求文档 §16 明确要求的。
 */
export function SourceList({
  sources,
  title = '资料来源',
  id = 'sources',
}: {
  sources: readonly SourceRef[]
  title?: string
  id?: string
}) {
  if (sources.length === 0) return null

  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="text-[15px] font-bold tracking-tight text-ink-950">
        {title}
      </h2>

      <ol className="mt-3 space-y-3">
        {sources.map((source, index) => (
          <li
            key={source.id}
            className="rounded-xl border border-sand-200 bg-white p-4"
            id={`source-${source.id}`}
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-sand-100 text-[11px] font-semibold text-sand-600">
                {index + 1}
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-medium leading-relaxed text-ink-900">
                  {source.title}
                </p>

                <p className="mt-1 text-[12.5px] text-sand-500">
                  {[
                    source.authors?.join('、'),
                    source.publisher,
                    source.year ? String(source.year) : undefined,
                  ]
                    .filter(Boolean)
                    .join(' · ') || '—'}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <EvidenceBadge level={source.evidenceLevel} showLabel />
                  <span className="text-[11.5px] text-sand-500">
                    {EVIDENCE[source.evidenceLevel].description}
                  </span>
                </div>

                {source.verification !== 'independent' ? (
                  <p className="mt-2 text-[12px] text-caution-700">
                    {COMPANY_SUPPLIED_MARKER}
                  </p>
                ) : null}

                {source.verificationNote ? (
                  <p className="mt-1.5 text-[12px] text-sand-600">{source.verificationNote}</p>
                ) : null}

                {source.usageRestriction ? (
                  <p className="mt-1.5 rounded-md bg-alert-50 px-2.5 py-1.5 text-[12px] text-alert-700">
                    资料使用限制：{source.usageRestriction}
                  </p>
                ) : null}

                {source.url ? (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="mt-2 inline-block text-[12.5px] text-ink-600 underline underline-offset-2 hover:text-ink-800"
                  >
                    查看原始资料
                  </a>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
