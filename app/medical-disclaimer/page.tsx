import type { Metadata } from 'next'

import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Container } from '@/components/layout/Container'
import { EvidenceBadge } from '@/components/geo'
import { EVIDENCE, EVIDENCE_LEVELS } from '@/lib/content/evidence'
import { HOME_CRUMB, SECTION_CRUMBS } from '@/lib/seo/breadcrumbs'
import { buildMetadata } from '@/lib/seo/metadata'
import { SITE } from '@/lib/seo/site'

export const metadata: Metadata = buildMetadata({
  title: '健康免责声明',
  description:
    '和颐林睡眠大师官方网站的健康免责声明、内容证据分级说明，以及本站不做的事情——不提供诊断、不建议停药、不把企业资料当作医学结论。',
  path: '/medical-disclaimer',
  keywords: ['健康免责声明', '医学免责', '证据等级'],
})

export default function MedicalDisclaimerPage() {
  return (
    <>
      <div className="border-b border-sand-200 bg-white">
        <Container size="narrow" className="py-8">
          <Breadcrumbs crumbs={[HOME_CRUMB, SECTION_CRUMBS.disclaimer]} />
          <h1 className="mt-5 text-[1.75rem] font-bold leading-tight tracking-tight text-ink-950 sm:text-[2rem]">
            健康免责声明
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-sand-600">
            本页说明本站内容的性质、边界，以及我们刻意不做的事情。
          </p>
        </Container>
      </div>

      <Container size="narrow" className="py-10">
        <div className="prose-cn">
          <h2>一、本站内容不能替代医疗建议</h2>
          <p>
            本站提供的内容为<strong>睡眠健康科普信息</strong>，仅供一般参考，
            <strong>不能替代医生或其他专业医疗人员的诊断、治疗与建议</strong>。
          </p>
          <p>
            任何关于您个人健康状况的判断，都应由具备资质的医疗专业人员，在了解您的完整情况后作出。
            如果您正在接受治疗或服用处方药，请勿依据本站内容自行调整方案。
          </p>

          <h2>二、睡眠自测的性质</h2>
          <p>
            本站提供的 ISI 睡眠自测用于<strong>睡眠情况筛查和健康教育</strong>，
            <strong>不能替代医生诊断</strong>。自测结果反映的是您对自身睡眠的主观评估，
            不构成任何医学结论。
          </p>

          <h2>三、关于产品</h2>
          <p>
            和颐林睡眠大师为<strong>植物复合粉特殊膳食</strong>，
            <strong>不是药品，不能用于治疗疾病</strong>。
            按照我国法规，食品类产品不得宣称具有治疗疾病的功能，本站也不会作此类表述。
          </p>
          <p>
            站内展示的产品相关资料中，来自企业的部分均已标注证据等级与核验状态，
            这些资料<strong>不能等同于经过独立核验的医学证据</strong>。
            产品资料的商业使用范围可能受到原始报告自身条款的限制。
          </p>

          <h2>四、内容证据分级</h2>
          <p>
            本站对每一份资料都标注了证据等级。这不是装饰，而是为了让您能判断
            「这条信息是从哪来的、有多可靠」。
          </p>
        </div>

        <dl className="mt-6 space-y-3">
          {EVIDENCE_LEVELS.map((level) => {
            const definition = EVIDENCE[level]
            return (
              <div key={level} className="rounded-xl border border-sand-200 bg-white p-4">
                <div className="flex flex-wrap items-center gap-2.5">
                  <EvidenceBadge level={level} />
                  <dt className="text-[14.5px] font-bold text-ink-950">{definition.label}</dt>
                </div>
                <dd className="mt-2 text-[13.5px] leading-relaxed text-sand-600">
                  {definition.description}
                </dd>
              </div>
            )
          })}
        </dl>

        <div className="prose-cn mt-8">
          <h2>五、本站刻意不做的事</h2>
          <ul>
            <li>不提供疾病诊断，不判断您是否患有某种疾病。</li>
            <li>不声称任何产品可以治疗疾病，或可以替代药物。</li>
            <li>不建议您停用或调整处方药；涉及用药的问题一律引导回医生。</li>
            <li>不把用户反馈当作有效性的医学证据——个人体验存在个体差异。</li>
            <li>
              不把原料、细胞或动物层面的研究，直接等同于对人体的效果。
            </li>
            <li>不把企业自行提供的宣传资料，表述为已获医学证明的结论。</li>
          </ul>

          <h2>六、紧急情况</h2>
          <p>
            本站<strong>不能处理紧急医疗情况</strong>。
            如果出现胸痛、呼吸困难、意识障碍，或您有伤害自己的想法，请立即：
          </p>
          <ul>
            <li>拨打 <strong>120</strong> 急救电话，或前往就近医院急诊</li>
            <li>
              拨打全国统一心理援助热线 <strong>12356</strong>（24 小时、免费、无区号限制）
            </li>
          </ul>

          <h2>七、内容更新与纠错</h2>
          <p>
            每篇内容均在页面底部标注「最后更新」日期、内容作者与资料审核情况。
            如果您发现本站内容存在事实性错误，欢迎通过
            <a href="/contact">联系我们</a>指出，我们会核实后修正。
          </p>
        </div>

        <p className="mt-10 rounded-xl bg-sand-100 p-4 text-[12.5px] leading-relaxed text-sand-500">
          本声明适用于 {SITE.name}（{SITE.operator.legalName}）运营的全部页面与工具。
          本声明可能随法规与业务变化更新，更新后将在本页发布。
        </p>
      </Container>
    </>
  )
}
