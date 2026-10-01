import { z } from 'zod'

/**
 * 分类体系（需求文档 §7、§8）。
 *
 * 分类只在这里定义一次，导航、面包屑、sitemap、AI 检索全部从这里取，
 * 避免同一个分类在五个地方写五遍然后慢慢漂移。
 */

// ---------------------------------------------------------------------------
// 文章分类
// ---------------------------------------------------------------------------

export const ARTICLE_CATEGORIES = [
  {
    slug: 'sleep-basic',
    label: '睡眠基础',
    description: '睡眠周期、深度睡眠、生物钟等基础概念。',
    path: '/sleep/basic',
    order: 1,
  },
  {
    slug: 'sleep-problems',
    label: '睡眠问题',
    description: '入睡困难、夜间易醒、早醒、睡眠浅等常见问题的解答。',
    path: '/sleep/problems',
    order: 2,
  },
  {
    slug: 'sleep-improvement',
    label: '睡眠改善',
    description: '睡眠环境、作息、光照、运动、饮食等可操作的改善方法。',
    path: '/sleep/improvement',
    order: 3,
  },
  {
    slug: 'sleep-nutrition',
    label: '睡眠营养',
    description: 'SOD、氨基酸、茶氨酸、GABA、硒等营养与睡眠的关系。',
    path: '/sleep/nutrition',
    order: 4,
  },
  {
    slug: 'product-brand',
    label: '产品与品牌',
    description: '和颐林睡眠大师的配方、使用方法、检测与资料说明。',
    path: '/product',
    order: 5,
  },
] as const

export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number]['slug']

export const articleCategorySchema = z.enum([
  'sleep-basic',
  'sleep-problems',
  'sleep-improvement',
  'sleep-nutrition',
  'product-brand',
])

export function getArticleCategory(slug: ArticleCategory) {
  const found = ARTICLE_CATEGORIES.find((c) => c.slug === slug)
  if (!found) throw new Error(`未知的文章分类：${slug}`)
  return found
}

// ---------------------------------------------------------------------------
// 睡眠问题分类（需求文档 §7 核心分类）
// ---------------------------------------------------------------------------

export const SLEEP_PROBLEM_CATEGORIES = [
  {
    slug: 'difficulty-initiating',
    label: '入睡困难',
    description: '躺下后长时间无法入睡。',
    order: 1,
  },
  {
    slug: 'night-awakening',
    label: '夜间易醒',
    description: '睡着后频繁醒来，醒后难以再次入睡。',
    order: 2,
  },
  {
    slug: 'early-awakening',
    label: '早醒',
    description: '凌晨醒来后再也睡不着，总睡眠时间不足。',
    order: 3,
  },
  {
    slug: 'light-sleep',
    label: '睡眠浅',
    description: '容易受声音、光线、环境变化影响而醒来。',
    order: 4,
  },
  {
    slug: 'insufficient-sleep-time',
    label: '睡眠时间不足',
    description: '总睡眠时长低于自身需要。',
    order: 5,
  },
  {
    slug: 'poor-sleep-quality',
    label: '睡眠质量下降',
    description: '睡够时长但醒后仍不解乏。',
    order: 6,
  },
  {
    slug: 'daytime-fatigue',
    label: '白天疲劳',
    description: '白天困倦、注意力难以集中。',
    order: 7,
  },
  {
    slug: 'circadian-disruption',
    label: '睡眠节律紊乱',
    description: '作息时间不固定、倒班或倒时差导致的节律问题。',
    order: 8,
  },
  {
    slug: 'sleep-anxiety',
    label: '睡眠焦虑',
    description: '对「今晚又睡不着」的担心本身影响入睡。',
    order: 9,
  },
  {
    slug: 'stress-related',
    label: '压力相关睡眠问题',
    description: '工作、学业、生活压力导致的睡眠变化。',
    order: 10,
  },
] as const

export type SleepProblemCategory = (typeof SLEEP_PROBLEM_CATEGORIES)[number]['slug']

export const sleepProblemCategorySchema = z.enum([
  'difficulty-initiating',
  'night-awakening',
  'early-awakening',
  'light-sleep',
  'insufficient-sleep-time',
  'poor-sleep-quality',
  'daytime-fatigue',
  'circadian-disruption',
  'sleep-anxiety',
  'stress-related',
])

/**
 * 首页「你是哪一种睡眠问题？」的四个入口（需求文档 §5.2）。
 * 与上面的分类是多对一关系，这里只做入口映射，不重复定义分类。
 */
export const HOME_PROBLEM_ENTRIES = [
  {
    category: 'difficulty-initiating',
    title: '入睡困难',
    summary: '晚上躺下很久仍然睡不着',
  },
  {
    category: 'night-awakening',
    title: '夜间易醒',
    summary: '睡着以后经常醒来',
  },
  {
    category: 'early-awakening',
    title: '早醒',
    summary: '凌晨醒来后难以再次入睡',
  },
  {
    category: 'light-sleep',
    title: '睡眠浅',
    summary: '容易受到声音、环境等影响',
  },
] as const satisfies readonly {
  category: SleepProblemCategory
  title: string
  summary: string
}[]

// ---------------------------------------------------------------------------
// AI 知识库分类（需求文档 §19）
// ---------------------------------------------------------------------------

export const KB_CATEGORIES = [
  { slug: 'sleep_basic', label: '睡眠基础' },
  { slug: 'sleep_problem', label: '睡眠问题' },
  { slug: 'sleep_quality', label: '睡眠质量' },
  { slug: 'sleep_improvement', label: '睡眠改善' },
  { slug: 'sleep_nutrition', label: '睡眠营养' },
  { slug: 'sleep_research', label: '睡眠研究' },
  { slug: 'product', label: '产品资料' },
  { slug: 'clinical', label: '临床资料' },
  { slug: 'testing', label: '检测资料' },
  { slug: 'faq', label: '常见问题' },
  { slug: 'compliance', label: '合规与声明' },
] as const

export type KbCategory = (typeof KB_CATEGORIES)[number]['slug']

export const kbCategorySchema = z.enum([
  'sleep_basic',
  'sleep_problem',
  'sleep_quality',
  'sleep_improvement',
  'sleep_nutrition',
  'sleep_research',
  'product',
  'clinical',
  'testing',
  'faq',
  'compliance',
])

// ---------------------------------------------------------------------------
// 产品中心分节（需求文档 §9、§11）
// ---------------------------------------------------------------------------

export const PRODUCT_SECTIONS = [
  { slug: 'basic', label: '产品基本信息', path: '/product', order: 1 },
  { slug: 'ingredients', label: '产品配方', path: '/product/ingredients', order: 2 },
  { slug: 'sod', label: 'SOD 资料', path: '/product/sod', order: 3 },
  { slug: 'four-enzyme', label: '四酶协同', path: '/product/four-enzyme', order: 4 },
  { slug: 'process', label: '产品工艺', path: '/product/process', order: 5 },
  { slug: 'usage', label: '使用方法', path: '/product/usage', order: 6 },
  { slug: 'testing', label: '检测资料', path: '/product/testing', order: 7 },
  { slug: 'patents', label: '专利资料', path: '/product/patents', order: 8 },
  { slug: 'research', label: '研究资料', path: '/product/research', order: 9 },
  { slug: 'faq', label: '常见问题', path: '/product/faq', order: 10 },
] as const

export type ProductSection = (typeof PRODUCT_SECTIONS)[number]['slug']

export const productSectionSchema = z.enum([
  'basic',
  'ingredients',
  'sod',
  'four-enzyme',
  'process',
  'usage',
  'testing',
  'patents',
  'research',
  'faq',
])

