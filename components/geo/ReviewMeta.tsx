import { CalendarClock, ShieldCheck, UserPen } from 'lucide-react'

/**
 * 内容可信度元信息（需求文档 §31）。
 *
 * 明确展示：谁写的、谁审的、什么时候更新的、内容类型是什么。
 * 这组信息同时服务三个对象——读者判断可信度、搜索引擎评估 E-E-A-T、AI 搜索判断时效性。
 */

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`
}

export function ReviewMeta({
  authorName,
  reviewerName,
  updatedAt,
  lastReviewedAt,
  contentType = '睡眠健康科普',
}: {
  authorName: string
  reviewerName?: string
  updatedAt: string
  lastReviewedAt?: string
  contentType?: string
}) {
  const items = [
    { icon: CalendarClock, label: '最后更新', value: formatDate(updatedAt) },
    { icon: UserPen, label: '内容作者', value: authorName },
    /*
     * 没有传入审核人就不显示这一行。
     *
     * 这里刻意**不设默认值**。默认值写法（reviewerName = getReviewerDisplayName()）会让
     * 没登记审核人的文章也挂上全站审核人的名字，等于凭空署名一次没发生过的医学审核。
     * 同样也不回退到「待专业审核」这类占位文案——那等于在公开页面上承认这篇没人审过。
     * 传不传、传谁，由调用方决定（睡眠问题专题页显式传全站审核人）。
     */
    ...(reviewerName ? [{ icon: ShieldCheck, label: '资料审核', value: reviewerName }] : []),
    ...(lastReviewedAt
      ? [{ icon: CalendarClock, label: '审核日期', value: formatDate(lastReviewedAt) }]
      : []),
  ]

  return (
    <aside className="rounded-xl border border-sand-200 bg-sand-100/60 p-4">
      <p className="text-[12px] font-medium text-sand-500">内容类型：{contentType}</p>
      <dl className="mt-2.5 grid gap-x-6 gap-y-2 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <item.icon className="size-3.5 shrink-0 text-sand-400" aria-hidden="true" />
            <dt className="text-[12.5px] text-sand-500">{item.label}：</dt>
            <dd className="text-[12.5px] font-medium text-sand-700">{item.value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  )
}
