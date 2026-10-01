import { NextResponse } from 'next/server'

import { leadSubmissionSchema } from '@/lib/content/schemas/lead'
import { buildLeadRecord, getLeadStore, hashIp } from '@/lib/leads/store'

/**
 * 线索提交接口。
 *
 * 隐私要求（《个人信息保护法》）：
 *  · 必须提交隐私政策同意，schema 里 privacyAccepted 是字面量 true
 *  · 只存储加盐后的 IP 哈希，绝不存原始 IP
 *  · 手机号、微信号不进入日志
 */

export const runtime = 'nodejs'

const hitBuckets = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 5
const RATE_WINDOW_MS = 10 * 60_000

function checkRateLimit(key: string): boolean {
  const now = Date.now()
  const bucket = hitBuckets.get(key)

  if (!bucket || now > bucket.resetAt) {
    hitBuckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true
  }
  if (bucket.count >= RATE_LIMIT) return false
  bucket.count += 1
  return true
}

export async function POST(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    ''

  if (ip && !checkRateLimit(ip)) {
    return NextResponse.json({ error: '提交过于频繁，请稍后再试。' }, { status: 429 })
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: '请求格式不正确。' }, { status: 400 })
  }

  const parsed = leadSubmissionSchema.safeParse(payload)
  if (!parsed.success) {
    // 只回传字段级错误信息，不回显用户提交的原始内容
    return NextResponse.json(
      {
        error: '提交的信息有误，请检查后重试。',
        fields: parsed.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      },
      { status: 400 },
    )
  }

  const ipHash = ip ? await hashIp(ip) : undefined
  const record = buildLeadRecord(parsed.data, {
    ...(ipHash ? { ipHash } : {}),
    userAgent: request.headers.get('user-agent') ?? undefined,
  })

  try {
    await getLeadStore().save(record)
  } catch (error) {
    // 服务端记录详细原因，但对客户端只返回通用信息，避免泄露内部结构
    console.error('[leads] 保存失败：', error)
    return NextResponse.json(
      { error: '提交失败，请稍后再试，或通过页面上的微信联系方式与我们联系。' },
      { status: 500 },
    )
  }

  // 日志中只出现内部 ID 与来源，绝不出现手机号或微信号
  console.info(`[leads] 新线索 ${record.id}（来源 ${record.source}）`)

  return NextResponse.json({ ok: true, id: record.id })
}
