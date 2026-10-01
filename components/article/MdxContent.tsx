import { MDXRemote } from 'next-mdx-remote/rsc'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'

import { cn } from '@/lib/utils/cn'

/**
 * MDX 正文渲染。
 *
 * 在 React Server Component 中编译，因此正文是**构建期生成的静态 HTML**，
 * 不需要客户端 JS 就能完整呈现——这对百度抓取与 AI 搜索都至关重要。
 *
 * 智能体（AI）与爬虫读到的正文与用户看到的完全一致。
 */
export function MdxContent({ source, className }: { source: string; className?: string }) {
  return (
    <div className={cn('prose-cn', className)}>
      <MDXRemote
        source={source}
        options={{
          parseFrontmatter: false,
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            // 标题生成 id + 锚点，便于引用与目录跳转
            rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: 'wrap' }]],
          },
        }}
      />
    </div>
  )
}
