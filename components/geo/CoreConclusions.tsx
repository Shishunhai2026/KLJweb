/**
 * 核心结论（需求文档 §30）。
 *
 * 3–5 条短句，让读者与 AI 在几秒内抓住要点。
 * 数量上下限由 Schema 强制，避免写成一段流水账或只有一条的空壳。
 */
export function CoreConclusions({ conclusions }: { conclusions: readonly string[] }) {
  if (conclusions.length === 0) return null

  return (
    <section aria-labelledby="core-conclusions">
      <h2
        id="core-conclusions"
        className="text-[15px] font-bold tracking-tight text-ink-950"
      >
        核心结论
      </h2>
      <ul className="mt-3 space-y-2.5">
        {conclusions.map((conclusion) => (
          <li key={conclusion} className="flex gap-3 text-[15px] leading-relaxed text-sand-700">
            <span
              className="mt-2 size-1.5 shrink-0 rounded-full bg-ink-400"
              aria-hidden="true"
            />
            <span>{conclusion}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
