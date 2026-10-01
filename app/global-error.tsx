'use client'

/**
 * 全局错误边界。
 *
 * 这是唯一会替换根布局的页面，因此必须自带 <html> 与 <body>，
 * 且不能依赖任何需要请求上下文的组件（如 JsonLd 之外的站内数据读取）。
 * 刻意保持极简：出错时最重要的是让人能离开这一页，而不是渲染一个漂亮的站点。
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="zh-CN">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#faf9f7',
          color: '#2e2b27',
          fontFamily:
            '"PingFang SC","Hiragino Sans GB","Microsoft YaHei",system-ui,sans-serif',
          lineHeight: 1.75,
        }}
      >
        <div style={{ maxWidth: '32rem', padding: '2rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0e2439' }}>
            页面出现了问题
          </h1>
          <p style={{ marginTop: '0.75rem', fontSize: '0.9375rem', color: '#5c564d' }}>
            很抱歉，加载这个页面时发生了错误。您可以重试一次，或者返回首页继续浏览。
          </p>
          {error.digest ? (
            <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#a8a196' }}>
              错误编号：{error.digest}
            </p>
          ) : null}
          <div
            style={{
              marginTop: '1.75rem',
              display: 'flex',
              gap: '0.75rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={reset}
              style={{
                padding: '0.65rem 1.5rem',
                borderRadius: '999px',
                border: 'none',
                background: '#1c3a59',
                color: '#fff',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              重试
            </button>
            {/*
              刻意使用原生 <a> 而不是 next/link：
              全局错误边界触发时路由可能已经不可用，next/link 的客户端跳转会失败。
              这是兜底页面，可靠性优先于客户端导航体验。
            */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                padding: '0.65rem 1.5rem',
                borderRadius: '999px',
                border: '1px solid #d5d0c6',
                background: '#fff',
                color: '#1c3a59',
                fontSize: '0.875rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              返回首页
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
