import type { Metadata, Viewport } from 'next'

import './globals.css'

import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SkipLink } from '@/components/layout/SkipLink'
import { JsonLd } from '@/components/seo/JsonLd'
import { buildOrganizationLd, buildWebSiteLd } from '@/lib/seo/jsonld'
import { SITE, SITE_ORIGIN } from '@/lib/seo/site'

export const metadata: Metadata = {
  // 所有相对地址（canonical / OG 图）都以它为基准解析成绝对地址
  metadataBase: new URL(SITE_ORIGIN),

  title: {
    default: `${SITE.name}｜${SITE.tagline}`,
    // 各页面只提供自己的标题，品牌后缀在这里统一拼装
    template: `%s｜${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.name }],
  publisher: SITE.operator.legalName,

  // 站点仅中文。x-default 指向中文版，避免爬虫猜测语言版本
  alternates: {
    canonical: '/',
    languages: { 'zh-CN': '/', 'x-default': '/' },
  },

  formatDetection: {
    // 手机号不应被自动识别成可点击链接——站内的联系方式由我们显式控制
    telephone: false,
    address: false,
    email: false,
  },

  openGraph: {
    type: 'website',
    siteName: SITE.name,
    locale: 'zh_CN',
    title: `${SITE.name}｜${SITE.tagline}`,
    description: SITE.description,
    url: SITE_ORIGIN,
    images: [{ url: SITE.defaultOgImage, width: 1200, height: 630, alt: SITE.name }],
  },

  twitter: {
    card: 'summary_large_image',
    title: `${SITE.name}｜${SITE.tagline}`,
    description: SITE.description,
    images: [SITE.defaultOgImage],
  },

  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: SITE.themeColor,
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={SITE.lang}>
      <body className="flex min-h-dvh flex-col antialiased">
        {/* 站点级结构化数据，全站只需要输出一次 */}
        <JsonLd id="ld-organization" data={buildOrganizationLd()} />
        <JsonLd id="ld-website" data={buildWebSiteLd()} />

        <SkipLink />
        <SiteHeader />

        <main id="main-content" className="flex-1">
          {children}
        </main>

        <SiteFooter />
      </body>
    </html>
  )
}
