import { loadYamlCollection } from './client'
import type { KnowledgeBaseEntry } from './schemas/knowledge'
import { knowledgeBaseEntrySchema } from './schemas/knowledge'
import type { KbCategory } from './taxonomy'

/**
 * 结构化睡眠问答（需求文档 §19）。
 *
 * 每条都按「规范问法 + 口语化同义问法 + 精简回答 + 展开说明」组织，
 * 因此每一条都必须自带完整语义，脱离上下文也能读懂——
 * 这既是为了页面上的一句话回答，也是为了 AI 搜索更容易整段引用。
 */

let cache: KnowledgeBaseEntry[] | null = null

export function getAllKbEntries(): KnowledgeBaseEntry[] {
  cache ??= loadYamlCollection('knowledge-base', knowledgeBaseEntrySchema).map((f) => f.data)
  return cache
}

export function getPublishedKbEntries(): KnowledgeBaseEntry[] {
  return getAllKbEntries().filter((e) => e.status === 'published')
}

export function getKbEntryById(id: string): KnowledgeBaseEntry | undefined {
  return getPublishedKbEntries().find((e) => e.id === id)
}

export function getKbEntriesByCategory(category: KbCategory): KnowledgeBaseEntry[] {
  return getPublishedKbEntries().filter((e) => e.category === category)
}

export function __resetKbCache(): void {
  cache = null
}
