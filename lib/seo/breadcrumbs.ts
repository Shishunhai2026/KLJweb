/**
 * 面包屑。
 *
 * 同一个数组同时驱动「可见的面包屑」与「BreadcrumbList 结构化数据」，
 * 两者在物理上无法漂移——这是需求文档 §38 要求面包屑与结构化数据一致的最省事做法。
 */

export interface Crumb {
  name: string
  path: string
}

export function buildCrumbs(...crumbs: (Crumb | null | undefined)[]): Crumb[] {
  return crumbs.filter((c): c is Crumb => c != null)
}

export const HOME_CRUMB: Crumb = { name: '首页', path: '/' }

/** 导航一级栏目对应的面包屑，供各页面复用。 */
export const SECTION_CRUMBS = {
  sleep: { name: '认识睡眠', path: '/sleep' },
  sleepBasic: { name: '睡眠基础', path: '/sleep/basic' },
  sleepProblems: { name: '睡眠问题', path: '/sleep/problems' },
  sleepImprovement: { name: '睡眠改善', path: '/sleep/improvement' },
  sleepNutrition: { name: '睡眠营养', path: '/sleep/nutrition' },
  selfTest: { name: '睡眠自测', path: '/sleep/self-test' },
  knowledge: { name: '睡眠知识库', path: '/knowledge' },
  product: { name: '和颐林睡眠大师', path: '/product' },
  testimonials: { name: '用户反馈', path: '/testimonials' },
  about: { name: '关于我们', path: '/about' },
  contact: { name: '联系我们', path: '/contact' },
  privacy: { name: '隐私政策', path: '/privacy' },
  terms: { name: '用户协议', path: '/terms' },
  disclaimer: { name: '健康免责声明', path: '/medical-disclaimer' },
} as const satisfies Record<string, Crumb>
