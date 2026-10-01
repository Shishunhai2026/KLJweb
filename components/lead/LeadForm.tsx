'use client'

import { CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { cn } from '@/lib/utils/cn'

/**
 * 线索收集表单。
 *
 * 隐私要点：勾选隐私政策是**必填**，且由服务端 schema 强制
 * （privacyAccepted 是字面量 true，不勾选无法通过校验）。
 *
 * 归因：自动带上当前页面路径与来源渠道，写进线索记录，
 * 让客户日后能回答「哪个关键词带来了客户」。
 */
export function LeadForm({
  source = 'direct',
  landingPage,
  sleepProblem,
  testScore,
  testSeverity,
  keyword,
}: {
  source?: string
  landingPage?: string
  sleepProblem?: string
  testScore?: number
  testSeverity?: string
  keyword?: string
}) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [consent, setConsent] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === 'submitting') return

    setError(null)

    const form = new FormData(event.currentTarget)
    const phone = String(form.get('phone') ?? '').trim()
    const wechat = String(form.get('wechat') ?? '').trim()

    if (!phone && !wechat) {
      setError('请至少填写手机号或微信号中的一项，否则我们无法与您联系。')
      return
    }
    if (!consent) {
      setError('请先阅读并同意隐私政策。')
      return
    }

    setStatus('submitting')

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: String(form.get('nickname') ?? '').trim() || undefined,
          phone: phone || undefined,
          wechat: wechat || undefined,
          source: detectSource(source),
          landingPage: landingPage ?? window.location.pathname,
          keyword: keyword ?? getUtmKeyword(),
          sleepProblem: sleepProblem || undefined,
          testScore,
          testSeverity,
          consent: { privacyAccepted: true, policyVersion: 'v1' },
        }),
      })

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string }
        setError(body.error ?? '提交失败，请稍后再试。')
        setStatus('idle')
        return
      }

      setStatus('done')
    } catch {
      setError('网络异常，请检查连接后重试。')
      setStatus('idle')
    }
  }

  if (status === 'done') {
    return (
      <div className="rounded-2xl border border-positive-100 bg-positive-50 p-6 text-center">
        <CheckCircle2 className="mx-auto size-8 text-positive-600" aria-hidden="true" />
        <h2 className="mt-3 text-[16px] font-bold text-ink-950">已收到您的信息</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-sand-600">
          我们会尽快与您联系。如果比较着急，也可以直接通过页面上的微信联系方式找到我们。
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-sand-200 bg-white p-6">
      <h2 className="text-[16px] font-bold text-ink-950">留下联系方式</h2>
      <p className="mt-1.5 text-[13.5px] text-sand-600">
        填写后我们会尽快与您联系。手机号与微信号仅用于本次沟通。
      </p>

      <div className="mt-5 space-y-4">
        <Field label="称呼" name="nickname" placeholder="怎么称呼您（选填）" maxLength={40} />
        <Field
          label="手机号"
          name="phone"
          type="tel"
          placeholder="用于我们与您联系"
          maxLength={20}
        />
        <Field label="微信号" name="wechat" placeholder="如果更方便用微信联系" maxLength={40} />
      </div>

      <label className="mt-5 flex cursor-pointer items-start gap-2.5">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          className="mt-0.5 size-4 shrink-0 rounded border-sand-300"
        />
        <span className="text-[13px] leading-relaxed text-sand-600">
          我已阅读并同意
          <Link href="/privacy" className="mx-1 text-ink-700 underline underline-offset-2">
            隐私政策
          </Link>
          ，同意贵方通过上述方式与我联系。
        </span>
      </label>

      {error ? (
        <p className="mt-4 rounded-lg bg-alert-50 px-3 py-2.5 text-[13px] text-alert-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className={cn(
          'mt-5 w-full rounded-full bg-ink-900 px-6 py-3 text-[14.5px] font-semibold text-white transition-colors hover:bg-ink-950',
          status === 'submitting' && 'opacity-60',
        )}
      >
        {status === 'submitting' ? '提交中…' : '提交'}
      </button>

      <p className="mt-3 text-[11.5px] leading-relaxed text-sand-400">
        我们不会将您的联系方式提供给第三方，也不会用于与本次咨询无关的用途。
      </p>
    </form>
  )
}

function Field({
  label,
  name,
  type = 'text',
  placeholder,
  maxLength,
}: {
  label: string
  name: string
  type?: string
  placeholder?: string
  maxLength?: number
}) {
  return (
    <div>
      <label htmlFor={`lead-${name}`} className="block text-[13px] font-medium text-ink-900">
        {label}
      </label>
      <input
        id={`lead-${name}`}
        name={name}
        type={type}
        placeholder={placeholder}
        maxLength={maxLength}
        className="mt-1.5 w-full rounded-lg border border-sand-300 px-3.5 py-2.5 text-[14.5px] outline-none transition-colors focus:border-ink-400"
      />
    </div>
  )
}

/** 把来源字符串收敛到 schema 允许的枚举值。 */
function detectSource(raw: string): string {
  const allowed = [
    'google',
    'baidu',
    'xiaohongshu',
    'douyin',
    'wechat',
    'direct',
    'ai_search',
    'other',
  ]
  return allowed.includes(raw) ? raw : 'other'
}

/** 从 URL 读取 utm_term 作为关键词归因。 */
function getUtmKeyword(): string | undefined {
  if (typeof window === 'undefined') return undefined
  const params = new URLSearchParams(window.location.search)
  return params.get('utm_term') ?? params.get('keyword') ?? undefined
}
