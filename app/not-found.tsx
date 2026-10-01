import type { Metadata } from 'next'
import Link from 'next/link'

import { Container } from '@/components/layout/Container'
import { ButtonLink } from '@/components/ui/Button'
import { PRIMARY_CTA } from '@/lib/nav'

export const metadata: Metadata = {
  title: '页面不存在',
  description: '您访问的页面不存在或已被移动。',
  robots: 'noindex,nofollow',
}

export default function NotFound() {
  return (
    <Container size="narrow" className="py-24 text-center">
      <p className="text-[13px] font-semibold tracking-[0.2em] text-ink-400">404</p>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-ink-950">
        没有找到这个页面
      </h1>
      <p className="mt-4 text-[14.5px] leading-relaxed text-sand-600">
        页面可能已被移动或删除。您可以返回首页，或者直接从下面这些入口继续浏览。
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href={PRIMARY_CTA.href}>免费睡眠自测</ButtonLink>
        <ButtonLink href="/knowledge" variant="secondary">
          睡眠知识库
        </ButtonLink>
        <ButtonLink href="/sleep/problems" variant="secondary">
          睡眠问题
        </ButtonLink>
      </div>

      <p className="mt-10 text-[13.5px] text-sand-500">
        或者
        <Link href="/" className="ml-1 text-ink-700 underline underline-offset-4">
          返回首页
        </Link>
      </p>
    </Container>
  )
}
