/**
 * JSON-LD 输出组件。
 *
 * 安全要点：`JSON.stringify` 的结果直接注入 <script>，
 * 若内容里含 `</script>` 会提前闭合标签形成 XSS。
 * 因此必须把 `<` 转义为 `<`——JSON 解析器会还原它，而 HTML 解析器不会。
 */
export function JsonLd({
  data,
  id,
}: {
  /**
   * 允许传 null：部分构造器（如 buildFaqPageLd）在数据不足时会返回 null，
   * 表示「这段结构化数据不该输出」（空的 FAQ 标记会被搜索引擎判为无效）。
   * 在这里统一短路，调用方无需逐个判空。
   */
  data: object | object[] | null
  id?: string
}) {
  if (data === null) return null

  const json = JSON.stringify(data).replace(/</g, '\\u003c')

  return <script type="application/ld+json" id={id} dangerouslySetInnerHTML={{ __html: json }} />
}
