import type { Metadata } from 'next'

import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Container } from '@/components/layout/Container'
import { HOME_CRUMB, SECTION_CRUMBS } from '@/lib/seo/breadcrumbs'
import { buildMetadata } from '@/lib/seo/metadata'
import { SITE } from '@/lib/seo/site'

export const metadata: Metadata = buildMetadata({
  title: '隐私政策',
  description:
    '和颐林睡眠大师官方网站的隐私政策：我们收集哪些信息、如何使用、如何保护，以及您享有哪些权利。',
  path: '/privacy',
  keywords: ['隐私政策', '个人信息保护'],
})

const POLICY_VERSION = 'v1'
const EFFECTIVE_DATE = '2026 年 10 月 1 日'

export default function PrivacyPage() {
  return (
    <>
      <div className="border-b border-sand-200 bg-white">
        <Container size="narrow" className="py-8">
          <Breadcrumbs crumbs={[HOME_CRUMB, SECTION_CRUMBS.privacy]} />
          <h1 className="mt-5 text-[1.75rem] font-bold leading-tight tracking-tight text-ink-950 sm:text-[2rem]">
            隐私政策
          </h1>
          <p className="mt-3 text-[13.5px] text-sand-500">
            版本 {POLICY_VERSION} · 生效日期 {EFFECTIVE_DATE}
          </p>
        </Container>
      </div>

      <Container size="narrow" className="py-10">
        <div className="prose-cn">
          <p>
            本政策说明 {SITE.operator.legalName}（以下称「我们」）在您使用
            {SITE.name} 网站时如何收集、使用与保护您的个人信息。
          </p>

          <h2>一、我们收集哪些信息</h2>
          <p>
            <strong>您主动提供的信息。</strong>
            当您在「联系我们」页面提交表单时，我们会收集您填写的称呼、手机号与微信号。
            这些信息用于与您取得联系。
          </p>
          <p>
            <strong>我们不收集的信息。</strong>
            睡眠自测的全部作答<strong>仅在您的浏览器中完成计算，不会上传到服务器</strong>，
            我们无法看到您的作答内容。站内没有任何需要您填写个人信息的交互功能——
            除「联系我们」表单外，其他页面都不会收集您的信息。
          </p>
          <p>
            <strong>自动收集的信息。</strong>
            出于安全与统计分析目的，我们会记录访问来源、访问页面与设备类型。
            我们<strong>不会存储您的原始 IP 地址</strong>，仅存储经过加盐哈希处理后的值，
            该值无法反推出您的真实地址。
          </p>

          <h2>二、我们如何使用这些信息</h2>
          <ul>
            <li>回复您的咨询，提供您所询问的产品或服务信息。</li>
            <li>了解哪些内容对用户有帮助，以改进网站。</li>
            <li>防范恶意提交与滥用行为。</li>
          </ul>
          <p>
            我们<strong>不会</strong>将您的联系方式提供给第三方，
            也不会用于与您本次咨询无关的用途。
          </p>

          <h2>三、Cookie 与统计工具</h2>
          <p>
            本站使用统计工具了解访问情况。这些工具可能设置 Cookie。
            您可以通过浏览器设置拒绝 Cookie，这不会影响您使用本站的主要内容与睡眠自测。
          </p>

          <h2>四、信息保存期限</h2>
          <p>
            我们会在实现上述目的所必需的期限内保存您的信息。
            如果您希望我们删除您的联系方式，可以通过「联系我们」页面提出，
            我们将在核实后处理。
          </p>

          <h2>五、您的权利</h2>
          <p>依据《中华人民共和国个人信息保护法》，您有权：</p>
          <ul>
            <li>查阅、复制我们持有的您的个人信息</li>
            <li>要求更正不准确的信息</li>
            <li>要求删除您的个人信息</li>
            <li>撤回您的同意</li>
          </ul>

          <h2>六、信息安全</h2>
          <p>
            我们采取合理的技术与管理措施保护您的信息，包括传输加密、
            对 IP 地址做加盐哈希处理、限制内部访问权限。
            但请注意，任何互联网传输都无法保证绝对安全。
          </p>

          <h2>七、未成年人</h2>
          <p>
            本站内容面向成年人。我们不面向未成年人收集个人信息。
            如果您是未成年人，请在监护人指导下使用本站，并由监护人决定是否提交联系方式。
          </p>

          <h2>八、政策更新</h2>
          <p>
            本政策可能随法规与业务变化更新。更新后我们会在本页发布新版本并调整生效日期。
          </p>

          <h2>九、联系我们</h2>
          <p>
            如对本政策有任何疑问，可通过
            <a href="/contact">联系我们</a>页面与我们取得联系。
          </p>
        </div>
      </Container>
    </>
  )
}
