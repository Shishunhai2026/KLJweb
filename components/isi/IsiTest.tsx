'use client'

import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { SELF_TEST_DISCLAIMER } from '@/lib/content/evidence'
import { ISI_ITEMS, type IsiAnswer, type IsiItemId } from '@/lib/isi/items'
import { buildIsiResult, type IsiResultView } from '@/lib/isi/recommend'
import { scoreIsi } from '@/lib/isi/scoring'
import { cn } from '@/lib/utils/cn'

type Stage = 'intro' | 'questions' | 'result'

/**
 * ISI 睡眠自测。
 *
 * 全部在客户端完成，不上传任何作答数据——这既避免了隐私问题，
 * 也让页面可以完全静态化（对 SEO 与访问速度都更好）。
 *
 * 结果页的区块顺序由 lib/isi/recommend.ts 的 RESULT_SECTION_ORDER 决定，
 * 并有单元测试保证「产品永远出现在最后」。
 */
export function IsiTest() {
  const [stage, setStage] = useState<Stage>('intro')
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Partial<Record<IsiItemId, IsiAnswer>>>({})

  const item = ISI_ITEMS[index]
  const answeredCount = Object.keys(answers).length
  const isLast = index === ISI_ITEMS.length - 1

  function choose(value: IsiAnswer) {
    if (!item) return
    const next = { ...answers, [item.id]: value }
    setAnswers(next)

    if (isLast) {
      setStage('result')
    } else {
      setIndex((i) => i + 1)
    }
  }

  function restart() {
    setAnswers({})
    setIndex(0)
    setStage('intro')
  }

  if (stage === 'intro') {
    return (
      <div className="rounded-2xl border border-sand-200 bg-white p-6 sm:p-8">
        <h2 className="text-xl font-bold tracking-tight text-ink-950">睡眠情况自测</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-sand-600">
          本自测采用 ISI 失眠严重程度指数（Insomnia Severity Index）量表，
          共 7 个问题，约需 2 分钟。
        </p>

        <dl className="mt-6 space-y-3">
          {[
            { t: '不用注册，不留联系方式', d: '所有作答都在您的浏览器中完成，不会上传。' },
            { t: '测完立即出结果', d: '包含当前睡眠情况、可能存在的问题与改善建议。' },
            { t: '结果可作就诊参考', d: '您可以把它记录下来，在就诊时提供给医生。' },
          ].map((row) => (
            <div key={row.t} className="flex gap-3">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-ink-400" aria-hidden="true" />
              <div>
                <dt className="text-[14.5px] font-medium text-ink-900">{row.t}</dt>
                <dd className="mt-0.5 text-[13.5px] text-sand-600">{row.d}</dd>
              </div>
            </div>
          ))}
        </dl>

        <div className="mt-6 rounded-xl bg-sand-100 p-4 text-[13px] leading-relaxed text-sand-600">
          {SELF_TEST_DISCLAIMER}
        </div>

        <button
          type="button"
          onClick={() => setStage('questions')}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink-900 px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-ink-950 sm:w-auto"
        >
          开始自测
          <ArrowRight className="size-4" aria-hidden="true" />
        </button>
      </div>
    )
  }

  if (stage === 'result') {
    // 分数与分级在本地计算，结果区块顺序由 recommend.ts 的契约决定
    const score = scoreIsi(answers as Record<IsiItemId, IsiAnswer>)
    const result = buildIsiResult(score)
    return <IsiResultView score={result} onRestart={restart} answers={answers} />
  }

  if (!item) return null

  return (
    <div className="rounded-2xl border border-sand-200 bg-white p-6 sm:p-8">
      {/* 进度 */}
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-sand-500">
          第 {index + 1} / {ISI_ITEMS.length} 题
        </p>
        <p className="text-[13px] text-sand-400">已完成 {answeredCount} 题</p>
      </div>
      <div
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-sand-100"
        role="progressbar"
        aria-valuenow={index + 1}
        aria-valuemin={1}
        aria-valuemax={ISI_ITEMS.length}
        aria-label="答题进度"
      >
        <div
          className="h-full rounded-full bg-ink-700 transition-all duration-300"
          style={{ width: `${((index + 1) / ISI_ITEMS.length) * 100}%` }}
        />
      </div>

      <h2 className="mt-6 text-[17px] font-bold leading-snug text-ink-950">{item.question}</h2>
      {item.hint ? <p className="mt-1.5 text-[13.5px] text-sand-500">{item.hint}</p> : null}

      <div className="mt-5 space-y-2">
        {item.options.map((option) => {
          const selected = answers[item.id] === option.value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => choose(option.value)}
              aria-pressed={selected}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-[14.5px] transition-colors',
                selected
                  ? 'border-ink-400 bg-ink-50 text-ink-900'
                  : 'border-sand-200 bg-white text-sand-700 hover:border-ink-200 hover:bg-sand-50',
              )}
            >
              <span
                className={cn(
                  'flex size-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold',
                  selected ? 'border-ink-500 bg-ink-600 text-white' : 'border-sand-300 text-sand-500',
                )}
              >
                {option.value}
              </span>
              {option.label}
            </button>
          )
        })}
      </div>

      {index > 0 ? (
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          className="mt-5 inline-flex items-center gap-1.5 text-[13.5px] text-sand-500 transition-colors hover:text-ink-700"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          上一题
        </button>
      ) : null}

      <p className="mt-6 border-t border-sand-100 pt-4 text-[12.5px] leading-relaxed text-sand-500">
        {SELF_TEST_DISCLAIMER}
      </p>
    </div>
  )
}

/** 结果展示。区块顺序完全由 result.sections 驱动。 */
function IsiResultView({
  score,
  answers,
  onRestart,
}: {
  score: IsiResultView
  answers: Partial<Record<IsiItemId, IsiAnswer>>
  onRestart: () => void
}) {
  const bandTone =
    score.score.band === 'severe'
      ? 'border-alert-100 bg-alert-50'
      : score.score.band === 'moderate'
        ? 'border-caution-100 bg-caution-50'
        : 'border-positive-100 bg-positive-50'

  return (
    <div className="space-y-6">
      <div className={cn('rounded-2xl border p-6 sm:p-8', bandTone)}>
        <p className="text-[13px] font-medium text-sand-600">您的睡眠自测结果</p>
        <div className="mt-3 flex flex-wrap items-baseline gap-3">
          <span className="text-[2.5rem] font-bold leading-none tabular-nums text-ink-950">
            {score.score.total}
          </span>
          <span className="text-[14px] text-sand-500">/ 28 分</span>
          <span className="rounded-full bg-white/70 px-3 py-1 text-[13px] font-semibold text-ink-900">
            {score.bandLabel}
          </span>
        </div>
        <p className="mt-4 text-[14.5px] leading-relaxed text-sand-700">{score.bandSummary}</p>
        <p className="mt-4 text-[12.5px] leading-relaxed text-sand-500">{SELF_TEST_DISCLAIMER}</p>
      </div>

      {/* 按 sections 契约顺序渲染 */}
      {score.sections.map((section) => {
        switch (section) {
          case 'likelyProblems':
            return score.likelyProblems.length > 0 ? (
              <section key={section} className="rounded-2xl border border-sand-200 bg-white p-6">
                <h2 className="text-[16px] font-bold text-ink-950">可能比较突出的方面</h2>
                <p className="mt-1.5 text-[13px] text-sand-500">
                  这是根据各题得分推断的参考方向，不是诊断结论。
                </p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {score.likelyProblems.map((p) => (
                    <li key={p}>
                      <Link
                        href={`/sleep/problems/${p}`}
                        className="inline-flex rounded-full border border-ink-200 bg-ink-50 px-3.5 py-1.5 text-[13px] font-medium text-ink-800 transition-colors hover:bg-ink-100"
                      >
                        {PROBLEM_LABELS[p] ?? p}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null

          case 'articles':
            return (
              <section key={section} className="rounded-2xl border border-sand-200 bg-white p-6">
                <h2 className="text-[16px] font-bold text-ink-950">推荐阅读</h2>
                <ul className="mt-3 space-y-2.5">
                  {RECOMMENDED_READING.map((a) => (
                    <li key={a.href}>
                      <Link
                        href={a.href}
                        className="flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-sand-50"
                      >
                        <span className="text-[14.5px] text-ink-800">{a.title}</span>
                        <ArrowRight className="size-4 shrink-0 text-sand-400" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )

          case 'advice':
            return (
              <section key={section} className="rounded-2xl border border-sand-200 bg-white p-6">
                <h2 className="text-[16px] font-bold text-ink-950">可以尝试的改善方向</h2>
                <ul className="mt-3 space-y-2.5">
                  {score.advice.map((line) => (
                    <li key={line} className="flex gap-3 text-[14.5px] leading-relaxed text-sand-700">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-gold-400" aria-hidden="true" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )

          case 'productTeaser':
            // 产品入口永远排在最后（需求文档 §6.2）
            return (
              <section key={section} className="rounded-2xl border border-sand-200 bg-white p-6">
                <h2 className="text-[16px] font-bold text-ink-950">了解和颐林睡眠大师</h2>
                <p className="mt-2 text-[14px] leading-relaxed text-sand-600">
                  如果您想了解产品的配方、检测资料与使用方法，
                  产品中心里有完整的说明，其中来自企业的资料均标注了证据等级与核验状态。
                </p>
                <Link
                  href="/product"
                  className="mt-4 inline-flex items-center gap-2 text-[14px] font-medium text-ink-700 hover:text-ink-900"
                >
                  进入产品中心
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </section>
            )

          default:
            return null
        }
      })}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex items-center gap-2 rounded-full border border-sand-300 bg-white px-5 py-2.5 text-[14px] font-medium text-ink-900 transition-colors hover:bg-sand-50"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          重新自测
        </button>
      </div>

      {/* 仅供参考：作答明细不上传，这里也不展示原始答案 */}
      <p className="text-[12px] text-sand-400">
        本次作答共 {Object.keys(answers).length} 题，全部在您的浏览器中完成，未上传到服务器。
      </p>
    </div>
  )
}

const PROBLEM_LABELS: Record<string, string> = {
  'difficulty-initiating': '入睡困难',
  'night-awakening': '夜间易醒',
  'early-awakening': '早醒',
  'light-sleep': '睡眠浅',
  'poor-sleep-quality': '睡眠质量下降',
  'daytime-fatigue': '白天疲劳',
}

const RECOMMENDED_READING = [
  { title: '什么是睡眠周期？一个周期多长时间', href: '/knowledge/what-is-sleep-cycle' },
  { title: '什么是深度睡眠？为什么它决定了睡醒后的状态', href: '/knowledge/what-is-deep-sleep' },
  { title: '如何提高睡眠质量？从这六件事开始', href: '/knowledge/how-to-improve-sleep-quality' },
  { title: '躺下很久睡不着怎么办？', href: '/knowledge/cant-fall-asleep' },
  { title: '为什么半夜总是醒？', href: '/knowledge/why-wake-up-at-night' },
]
