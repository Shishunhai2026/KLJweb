import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { Container } from '@/components/layout/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'

/**
 * 首页第二屏：睡眠不好的身体症状。
 *
 * 表现方式刻意用夸张、带幽默感的卡通插画，而不是写实的医学图示——
 * 睡眠问题本身已经让人焦虑，一上来就放器官病变图只会加重负担，
 * 而「看着自己的黑眼圈笑一下」反而更容易让人愿意继续往下看。
 *
 * ⚠️ 合规要点：这些是「可能的表现」，不是诊断标准，也不是本产品的适应症。
 *    页面底部必须带免责说明；每一条都链接到对应的科普文章，
 *    而不是链接到产品。症状 → 知识，这是本站的漏斗顺序。
 */
const SYMPTOMS = [
  {
    id: 'dark-circles',
    name: '黑眼圈、眼睛浮肿',
    text: '睡不够时眼周循环变差，眼下容易发青发肿，看起来比实际更疲惫。',
    articleSlug: 'why-wake-up-at-night',
  },
  {
    id: 'daytime-drowsy',
    name: '白天犯困、总想打盹',
    text: '开会、通勤、看剧时不受控地走神打瞌睡，喝了咖啡也撑不了多久。',
    articleSlug: 'sleep-quality-vs-duration',
  },
  {
    id: 'brain-fog',
    name: '脑子转不动、记性变差',
    text: '反应变慢、话到嘴边想不起来、刚做的事转身就忘。',
    articleSlug: 'what-is-deep-sleep',
  },
  {
    id: 'irritable',
    name: '情绪烦躁、一点就着',
    text: '对小事格外没耐心，容易发火，也更容易觉得低落。',
    articleSlug: 'early-awakening-causes',
  },
  {
    id: 'dull-skin',
    name: '皮肤暗沉、状态下滑',
    text: '脸色发黄没光泽，气色差，护肤品似乎也救不回来。',
    articleSlug: 'what-is-rem-sleep',
  },
  {
    id: 'late-night-cravings',
    name: '半夜特别想吃东西',
    text: '越晚越想吃高糖高油的东西，白天反而没什么胃口。',
    articleSlug: 'cant-fall-asleep',
  },
]

export function BodySymptoms() {
  return (
    <section className="border-t border-sand-200 bg-white py-16 sm:py-20">
      <Container size="wide">
        <SectionHeading
          title="睡不好，身体会先告诉你"
          description="睡眠不足很少以「我睡不够」的形式出现，更多时候，它先表现在这些地方。"
        />

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SYMPTOMS.map((symptom) => (
            <li key={symptom.id}>
              <Link
                href={`/knowledge/${symptom.articleSlug}`}
                className="group flex h-full flex-col rounded-card border border-sand-200 bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-ink-200 hover:shadow-card-hover"
              >
                <div className="flex items-center justify-center rounded-xl bg-ink-50/70 py-4">
                  {/* SVG 插画：矢量，任意分辨率都清晰，体积只有 1.5KB 左右 */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/images/symptoms/${symptom.id}.svg`}
                    alt=""
                    aria-hidden="true"
                    width={112}
                    height={112}
                    className="size-28 transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>

                <h3 className="mt-4 text-[15.5px] font-bold text-ink-950">{symptom.name}</h3>
                <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-sand-600">
                  {symptom.text}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-600">
                  了解这一现象
                  <ArrowRight
                    className="size-3.5 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-6 max-w-3xl text-[12.5px] leading-relaxed text-sand-500">
          以上为睡眠不足时常见的表现，用于帮助您对照自身情况，
          <strong className="font-medium text-sand-600">不构成医学诊断标准</strong>。
          这些表现也可能与其他健康状况有关，如持续存在并影响生活，建议就医评估。
        </p>
      </Container>
    </section>
  )
}
