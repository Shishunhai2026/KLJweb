import type { MetadataRoute } from 'next'

import { SITE_ORIGIN } from '@/lib/seo/site'

/**
 * robots.txt
 *
 * 关于 AI 爬虫：本项目的前提之一就是获取 AI 搜索流量（需求文档 §1、§29），
 * 因此这里**显式放行**主流 AI 爬虫。
 * 默认的全量拒绝会让整条 AI 搜索渠道直接归零——
 * 如果后续出于内容授权考虑要收紧，改这里即可，但请先确认这与获客目标不冲突。
 */

/**
 * 静态导出（output: 'export'）要求每个路由显式声明为静态，
 * 否则构建期报「export const dynamic = "force-static" not configured」。
 * app/sitemap.ts 与 app/llms.txt/route.ts 已有同样的声明。
 */
export const dynamic = 'force-static'

const AI_CRAWLERS = [
  'GPTBot', // OpenAI / ChatGPT 抓取
  'OAI-SearchBot', // ChatGPT 搜索
  'ChatGPT-User',
  'PerplexityBot',
  'ClaudeBot',
  'anthropic-ai',
  'Google-Extended', // Gemini 训练与 grounding
  'Bytespider', // 豆包 / 字节
  'Amazonbot',
  'Applebot-Extended',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // 常规爬虫
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          // 自测结果页带用户作答参数，属于个性化内容，不应被收录
          '/sleep/self-test/result',
        ],
      },
      // AI 爬虫单独声明，确保不被上面的通配规则误伤
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow: ['/api/', '/admin/', '/sleep/self-test/result'],
      })),
    ],
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
    host: SITE_ORIGIN,
  }
}
