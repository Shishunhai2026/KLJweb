import { Sparkles } from 'lucide-react'

/**
 * Quick Answer（需求文档 §29）。
 *
 * 位置固定在正文最前面，用一句话直接回答标题里的问题。
 * 这是给 AI 搜索与精选摘要准备的——它们需要一段可以整段引用、
 * 且脱离上下文仍然成立的回答。
 *
 * 内容约束由 content:lint 强制：不得夹带产品名与促销信息。
 */
export function QuickAnswer({ children }: { children: string }) {
  return (
    <div className="rounded-xl border border-ink-100 bg-ink-50/60 p-5">
      <div className="flex items-center gap-2">
        <Sparkles className="size-4 text-ink-500" aria-hidden="true" />
        <h2 className="text-[13px] font-semibold tracking-wide text-ink-800">直接回答</h2>
      </div>
      <p className="mt-2.5 text-[15px] leading-relaxed text-ink-900">{children}</p>
    </div>
  )
}
