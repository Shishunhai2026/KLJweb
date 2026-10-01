import type { NextConfig } from 'next'

/**
 * 纯静态导出：产物在 out/，整体上传到阿里云虚拟主机。
 *
 * 本项目部署在**共享虚拟主机**（无 SSH、无 Node 运行时），因此不存在服务端进程——
 * Route Handler、headers()、图片优化全部不可用。唯一的动态能力（线索提交）
 * 由 `public/api/leads.php` 承接（PHP 是虚拟主机原生支持的）。
 *
 * 注意：以下配置在 export 模式下**只会产生一条构建警告然后静默失效**，
 * 因此已全部删除，避免它们看起来还在生效：
 *   · headers()               —— 安全响应头改由主机层配置，见 deploy/README.md
 *   · outputFileTracingIncludes / Excludes —— export 不产出 server trace
 */
const nextConfig: NextConfig = {
  output: 'export',

  /*
   * 带尾斜杠：产物是 about/index.html，任何主机零配置即可正确服务。
   *
   * 不带尾斜杠的产物是 about.html，需要主机把 /about 映射过去——那要靠伪静态规则，
   * 而共享主机的伪静态框能否配置、配了是否生效都无法预先确认，配不上则除首页外全部 404。
   * 因此这里选带斜杠形态，把部署对主机配置的依赖降到零。
   *
   * ⚠️ 这个值必须与 lib/seo/site.ts 的 TRAILING_SLASH 常量保持一致。两处不一致会让
   * canonical 与实际服务的 URL 形态不符，而且**不会报错**。上线后也不可再切换：
   * 共享主机通常表达不出 /about ⇄ /about/ 的 301。
   */
  trailingSlash: true,

  /*
   * Next 16 已移除构建期内置的 ESLint 检查，代码检查统一由
   * `npm run lint` / `npm run verify` 负责，构建只负责产出。
   */
  poweredByHeader: false,
  reactStrictMode: true,

  /*
   * 静态导出没有图片优化服务，默认 loader 会直接让构建失败。
   * 当前全站没有一处使用 next/image（都是 <img> 直引 public/ 下已优化好的 webp），
   * 所以现在不会报错；这一行是为了防止将来有人引入 <Image> 时踩坑。
   */
  images: { unoptimized: true },
}

export default nextConfig
