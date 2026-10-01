import { COMPANY_SUPPLIED_MARKER, EVIDENCE, type EvidenceLevel } from '@/lib/content/evidence'
import { cn } from '@/lib/utils/cn'

/**
 * 证据等级徽章（需求文档 §14）。
 *
 * 关键设计：Level 3 及以上的资料，核验标记**内联渲染在正文里**，
 * 而不是只放在 tooltip 或图例里。
 * 用户不悬停、不展开也能看到「这是企业提供的资料」——
 * 悬停才可见的免责声明，在合规上等于没有。
 */
export function EvidenceBadge({
  level,
  showLabel = false,
  className,
}: {
  level: EvidenceLevel
  showLabel?: boolean
  className?: string
}) {
  const definition = EVIDENCE[level]
  const independent = definition.independent

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-none',
        independent
          ? 'border-positive-100 bg-positive-50 text-positive-700'
          : 'border-caution-100 bg-caution-50 text-caution-700',
        className,
      )}
    >
      {definition.short}
      {showLabel ? <span className="font-normal">{definition.label}</span> : null}
    </span>
  )
}

/**
 * 企业提供资料的核验提示。
 * Level 3–6 的资料旁必须出现这句，措辞不允许改写。
 */
export function CompanySuppliedNote({ className }: { className?: string }) {
  return (
    <span className={cn('text-[12px] text-caution-700', className)}>
      {COMPANY_SUPPLIED_MARKER}
    </span>
  )
}
