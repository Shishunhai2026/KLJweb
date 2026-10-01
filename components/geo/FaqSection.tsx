import { Plus } from 'lucide-react'

import type { FaqItem } from '@/lib/content/schemas/common'

/**
 * FAQ 区块（需求文档 §29：每篇至少 5 个问题）。
 *
 * 用原生 <details>/<summary> 而不是 Radix 之类的 JS 折叠组件，原因很实际：
 * 原生 details 的**答案始终存在于初始 HTML 中**。
 * 百度对 JS 渲染的支持有限，AI 爬虫也通常不执行 JS——
 * 用客户端组件折叠会让这些问题对它们彻底不可见，而 FAQ 恰恰是最适合被引用的内容。
 */
export function FaqSection({
  faq,
  title = '常见问题',
  id = 'faq',
}: {
  faq: readonly FaqItem[]
  title?: string
  id?: string
}) {
  if (faq.length === 0) return null

  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="text-[15px] font-bold tracking-tight text-ink-950">
        {title}
      </h2>
      <div className="mt-3 divide-y divide-sand-200 rounded-xl border border-sand-200 bg-white">
        {faq.map((item) => (
          <details key={item.question} className="group px-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[14.5px] font-medium text-ink-900 marker:content-none">
              <span>{item.question}</span>
              <Plus
                className="size-4 shrink-0 text-sand-400 transition-transform duration-200 group-open:rotate-45"
                aria-hidden="true"
              />
            </summary>
            <p className="pb-4 text-[14.5px] leading-relaxed text-sand-700">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
