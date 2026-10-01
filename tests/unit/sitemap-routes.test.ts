import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { STATIC_ROUTES } from '@/lib/seo/routes'

/**
 * STATIC_ROUTES 里登记的每条路径都必须真的有页面。
 *
 * 这条断言来自一次真实事故：STATIC_ROUTES 曾经硬编码了 9 个产品分节
 * （sod / four-enzyme / process / patents / research …），而上线的只有 4 个——
 * sitemap 因此收录了 5 个 404 的 URL。
 *
 * 根因是**静态清单与目录结构之间没有任何机制保证一致**：
 * 类型系统管不到「这个路径到底有没有页面」，构建也不会因为 sitemap 多了一条而失败。
 * 所以只能在这里用文件系统核对——往清单里加路径时，忘了建页就会当场红。
 */

const APP_DIR = join(process.cwd(), 'app')

/** '/product/ingredients' → 'app/product/ingredients/page.tsx'；'/' → 'app/page.tsx' */
function pageFileFor(pathname: string): string {
  return join(APP_DIR, ...pathname.split('/').filter(Boolean), 'page.tsx')
}

describe('静态路由 —— 每条都必须有对应页面', () => {
  for (const route of STATIC_ROUTES) {
    it(`${route.path} 存在 page.tsx`, () => {
      expect(
        existsSync(pageFileFor(route.path)),
        `${route.path} 在 STATIC_ROUTES 中登记，但缺少 ${pageFileFor(route.path)}——` +
          `sitemap 会收录一个 404。请建页，或把它从清单里去掉。`,
      ).toBe(true)
    })
  }
})
