import { appendFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

import { ulid } from 'ulid'

import type { LeadRecord, LeadSubmission } from '../content/schemas/lead'

/**
 * 线索存储。
 *
 * 默认实现是追加写的 JSONL 文件——不需要数据库即可上线。
 * 之所以做成接口而不是直接写文件：客户后续换成 PostgreSQL / Supabase 时，
 * 只需新增一个实现，API 路由与页面完全不用改。
 *
 * ⚠️ JSONL 模式下必须单进程写入（PM2 用 fork 模式、单实例）。
 *    多进程并发追加会交错损坏文件。需要多实例时请切换到 postgres 实现。
 */
export interface LeadStore {
  save(lead: LeadRecord): Promise<void>
}

class JsonlLeadStore implements LeadStore {
  constructor(private readonly filePath: string) {}

  async save(lead: LeadRecord): Promise<void> {
    await mkdir(path.dirname(this.filePath), { recursive: true })
    // 一行一条记录，追加写。末尾换行保证下一次追加不会粘在同一行。
    await appendFile(this.filePath, `${JSON.stringify(lead)}\n`, 'utf8')
  }
}

/**
 * 从请求中提取可归因的元信息。
 *
 * 隐私要点：**绝不存储原始 IP**。这里只保留加盐哈希值，
 * 用于识别重复提交与简单风控，无法反推回真实地址。
 */
export function buildLeadRecord(
  submission: LeadSubmission,
  context: { ipHash?: string; userAgent?: string },
): LeadRecord {
  const now = new Date().toISOString()

  return {
    ...submission,
    id: ulid(),
    consultationStatus: 'new',
    consent: {
      privacyAccepted: true,
      acceptedAt: now,
      policyVersion: submission.consent.policyVersion,
    },
    createdAt: now,
    updatedAt: now,
    ...(context.ipHash ? { ipHash: context.ipHash } : {}),
    meta: {
      ...submission.meta,
      ...(context.userAgent ? { userAgent: context.userAgent.slice(0, 500) } : {}),
    },
  }
}

/** 对 IP 做加盐 SHA-256。无盐值的哈希可被彩虹表反查，因此盐必须配置。 */
export async function hashIp(ip: string): Promise<string | undefined> {
  const salt = process.env.IP_HASH_SALT?.trim()
  if (!salt) {
    // 未配置盐值时不存储哈希，而不是存一个可被反查的弱哈希
    return undefined
  }

  const { createHash } = await import('node:crypto')
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex')
}

let storeCache: LeadStore | null = null

export function getLeadStore(): LeadStore {
  if (storeCache) return storeCache

  const mode = process.env.LEAD_STORE?.trim() || 'jsonl'

  if (mode === 'postgres') {
    // 预留：实现 PostgresLeadStore 后在此接入，其余代码无需修改
    throw new Error(
      'LEAD_STORE=postgres 尚未实现。请先使用默认的 jsonl 模式，' +
        '或在 lib/leads/store.ts 中补充 Postgres 实现。',
    )
  }

  const filePath = path.resolve(
    process.cwd(),
    process.env.LEAD_STORE_PATH?.trim() || './data/runtime/leads.jsonl',
  )
  storeCache = new JsonlLeadStore(filePath)
  return storeCache
}
