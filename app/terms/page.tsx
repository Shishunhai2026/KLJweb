import type { Metadata } from 'next'

import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Container } from '@/components/layout/Container'
import { HOME_CRUMB, SECTION_CRUMBS } from '@/lib/seo/breadcrumbs'
import { buildMetadata } from '@/lib/seo/metadata'
import { SITE } from '@/lib/seo/site'

export const metadata: Metadata = buildMetadata({
  title: '用户协议',
  description:
    '和颐林睡眠大师官方网站的用户协议：使用本站内容与工具时双方的权利与义务。',
  path: '/terms',
  keywords: ['用户协议', '使用条款'],
})

export default function TermsPage() {
  return (
    <>
      <div className="border-b border-sand-200 bg-white">
        <Container size="narrow" className="py-8">
          <Breadcrumbs crumbs={[HOME_CRUMB, SECTION_CRUMBS.terms]} />
          <h1 className="mt-5 text-[1.75rem] font-bold leading-tight tracking-tight text-ink-950 sm:text-[2rem]">
            用户协议
          </h1>
          <p className="mt-3 text-[13.5px] text-sand-500">生效日期 2026 年 10 月 1 日</p>
        </Container>
      </div>

      <Container size="narrow" className="py-10">
        <div className="prose-cn">
          <p>
            欢迎使用 {SITE.name}。您访问或使用本站，即表示您已阅读并同意本协议。
            如不同意，请停止使用。
          </p>

          <h2>一、服务内容</h2>
          <p>
            本站提供睡眠健康科普内容、睡眠自测工具，
            以及 {SITE.name} 产品的公开资料。上述服务均免费提供。
          </p>

          <h2>二、内容性质与重要限制</h2>
          <p>
            本站内容为<strong>健康科普信息，不构成医疗建议</strong>，
            不能替代医生或其他专业医疗人员的诊断与治疗。
          </p>
          <p>
            <strong>睡眠自测</strong>用于睡眠情况筛查与健康教育，
            <strong>不是医学诊断工具</strong>，其结果不构成任何医学结论。
          </p>

          <h2>三、您的使用规范</h2>
          <p>使用本站时，您同意不进行以下行为：</p>
          <ul>
            <li>以自动化手段大量抓取本站内容，影响网站正常运行</li>
            <li>提交虚假信息，或未经他人同意提交他人的联系方式</li>
            <li>利用本站服务从事违法违规活动</li>
            <li>试图绕过、破坏本站的安全措施</li>
          </ul>

          <h2>四、知识产权</h2>
          <p>
            本站的页面设计、文字内容与数据整理成果归我们或相应权利人所有。
            您可以出于个人学习目的浏览与引用，但转载、批量复制或用于商业用途，
            需事先获得书面许可。
          </p>
          <p>
            本站引用的第三方研究资料，其权利归原作者或出版方所有，
            我们仅在合理范围内标注来源并加以说明。
          </p>

          <h2>五、服务变更与中断</h2>
          <p>
            我们可能因维护、升级或不可抗力等原因，暂时或永久地变更、中断部分或全部服务。
            我们会尽合理努力保证服务的连续性，但不对因此造成的不便承担责任。
          </p>

          <h2>六、免责</h2>
          <p>
            您基于本站内容作出的任何决定，应由您自行判断并承担相应后果。
            对于因使用或无法使用本站服务而产生的损失，我们在法律允许的范围内不承担责任。
          </p>
          <p>
            尤其需要说明：<strong>
              如果您正在接受失眠治疗或服用处方药，请勿依据本站内容自行调整用药方案
            </strong>，相关决定必须与您的医生讨论。
          </p>

          <h2>七、协议更新</h2>
          <p>
            我们可能更新本协议。更新后的协议将在本页发布，继续使用本站即视为接受更新内容。
          </p>

          <h2>八、适用法律</h2>
          <p>本协议适用中华人民共和国法律。</p>
        </div>
      </Container>
    </>
  )
}
