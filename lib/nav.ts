/**
 * 全站导航配置（需求文档 §4 的信息架构）。
 *
 * 一级导航原方案有 10 项，直接铺在页头会挤成一团且降低每一项的可见度。
 * 这里把「认识睡眠」下的四个栏目收进下拉，其余保持一级，
 * 保证页头在 1280px 宽度下仍有余量，同时不丢失任何一个入口。
 */

export interface NavChild {
  label: string
  href: string
  description?: string
}

export interface NavItem {
  label: string
  href: string
  children?: NavChild[]
}

export const PRIMARY_NAV: readonly NavItem[] = [
  {
    label: '认识睡眠',
    href: '/sleep',
    children: [
      { label: '睡眠基础', href: '/sleep/basic', description: '睡眠周期、深度睡眠、生物钟' },
      { label: '睡眠问题', href: '/sleep/problems', description: '入睡困难、夜间易醒、早醒、睡眠浅' },
      { label: '睡眠改善', href: '/sleep/improvement', description: '环境、作息、光照、运动与饮食' },
      { label: '睡眠营养', href: '/sleep/nutrition', description: 'SOD、氨基酸、茶氨酸、GABA、硒' },
    ],
  },
  { label: '睡眠知识库', href: '/knowledge' },
  { label: '和颐林睡眠大师', href: '/product' },
  { label: '用户反馈', href: '/testimonials' },
  { label: '关于我们', href: '/about' },
]

/** 全站第一 CTA（需求文档 §4：右上角「免费睡眠自测」）。 */
export const PRIMARY_CTA = {
  label: '免费睡眠自测',
  href: '/sleep/self-test',
} as const

/** 页脚栏目。 */
export const FOOTER_NAV: readonly { title: string; links: NavChild[] }[] = [
  {
    title: '认识睡眠',
    links: [
      { label: '睡眠基础', href: '/sleep/basic' },
      { label: '睡眠问题', href: '/sleep/problems' },
      { label: '睡眠改善', href: '/sleep/improvement' },
      { label: '睡眠营养', href: '/sleep/nutrition' },
    ],
  },
  {
    title: '工具',
    links: [
      { label: '免费睡眠自测', href: '/sleep/self-test' },
      { label: '睡眠知识库', href: '/knowledge' },
    ],
  },
  {
    title: '产品',
    links: [
      { label: '产品中心', href: '/product' },
      { label: '产品配方', href: '/product/ingredients' },
      { label: '使用方法', href: '/product/usage' },
      { label: '检测资料', href: '/product/testing' },
    ],
  },
  {
    title: '关于',
    links: [
      { label: '关于我们', href: '/about' },
      { label: '联系我们', href: '/contact' },
      { label: '用户反馈', href: '/testimonials' },
    ],
  },
]

/** 页脚底部的法律与合规链接。 */
export const LEGAL_NAV: readonly NavChild[] = [
  { label: '隐私政策', href: '/privacy' },
  { label: '用户协议', href: '/terms' },
  { label: '健康免责声明', href: '/medical-disclaimer' },
]
