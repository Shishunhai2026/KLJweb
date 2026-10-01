import Link from 'next/link'

import { BrandMark } from '@/components/layout/BrandMark'
import { Container } from '@/components/layout/Container'
import { FOOTER_NAV, LEGAL_NAV, PRIMARY_CTA } from '@/lib/nav'
import { SITE } from '@/lib/seo/site'

/**
 * 页脚。
 *
 * 健康免责声明放在页脚显著位置而不是埋在法务页里——
 * 这是需求文档反复强调的合规要求，也是这个站点与纯营销站的根本区别。
 */
export function SiteFooter() {
  return (
    <footer className="mt-20 bg-night-gradient text-ink-100">
      <Container size="wide">
        <div className="py-14">
          <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
            <div>
              <BrandMark tone="light" />
              <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-ink-200">
                {SITE.tagline}。从了解睡眠开始，认识自己的睡眠问题，找到更适合自己的改善方向。
              </p>
              <Link
                href={PRIMARY_CTA.href}
                className="mt-5 inline-flex rounded-full bg-gold-400 px-4 py-2 text-[13px] font-semibold text-ink-950 transition-colors hover:bg-gold-300"
              >
                {PRIMARY_CTA.label}
              </Link>
            </div>

            {FOOTER_NAV.map((group) => (
              <nav key={group.title} aria-label={group.title}>
                <h2 className="text-[13px] font-semibold text-white">{group.title}</h2>
                <ul className="mt-4 space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-[13px] text-ink-200 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          {/*
            健康免责声明。措辞刻意保守：明确「不是医疗建议」「不替代医生」，
            并对产品做出「不是药品、不能治疗疾病」的定性。
          */}
          <div className="mt-12 rounded-xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-[13px] font-semibold text-gold-300">健康免责声明</h2>
            <p className="mt-2 text-[12.5px] leading-relaxed text-ink-200">
              本站提供的内容为睡眠健康科普信息，仅供一般参考，
              <strong className="font-semibold text-ink-100">
                不能替代医生或其他专业医疗人员的诊断、治疗与建议
              </strong>
              。睡眠自测结果用于筛查与健康教育，不构成医学诊断。如果您正在接受治疗或服用处方药，
              请勿依据本站内容自行调整用药方案，相关决定应与您的医生讨论。
            </p>
            <p className="mt-3 text-[12.5px] leading-relaxed text-ink-200">
              和颐林睡眠大师为植物复合粉特殊膳食，
              <strong className="font-semibold text-ink-100">不是药品，不能用于治疗疾病</strong>
              。站内展示的资料均标注了证据等级，其中来自企业的资料已标明核验状态，
              不能等同于经过独立核验的医学证据。用户体验分享存在个体差异，不构成产品功效保证。
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {LEGAL_NAV.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[12.5px] text-ink-200 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="text-[12.5px] text-ink-300">
            {/* 联系方式放在页脚，让用户在任何页面都能找到 */}
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>客服微信：{SITE.operator.wechat}</span>
              <a
                href={`tel:${SITE.operator.telephone}`}
                className="tabular-nums transition-colors hover:text-white"
              >
                {SITE.operator.telephone}
              </a>
            </p>
            {/*
              品牌所有方与站点运营方是两个不同的法律主体，必须分别标注。
              ICP 备案主体是运营方（长沙康龄纪），版权署名与备案保持一致。
            */}
            <p className="mt-2">
              品牌所有：{SITE.brandOwner.legalName}
            </p>
            <p className="mt-0.5">
              运营与销售：{SITE.operator.legalName}
            </p>
            <p className="mt-2">
              © 2026 {SITE.operator.legalName}
            </p>
            {SITE.icp ? (
              <p className="mt-1">
                <a
                  href="https://beian.miit.gov.cn/"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="transition-colors hover:text-white"
                >
                  {SITE.icp}
                </a>
              </p>
            ) : null}
          </div>
        </div>
      </Container>
    </footer>
  )
}
