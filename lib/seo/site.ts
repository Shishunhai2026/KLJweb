/**
 * 站点级常量与绝对地址解析。
 *
 * 全站唯一真源：域名、站名、默认 OG 图只在这里定义一次。
 * 任何组件、页面、sitemap、JSON-LD 都不得硬编码域名——
 * 一旦硬编码，上线换域名时就会出现一部分页面 canonical 指向旧域名的灾难。
 */

export const SITE = {
  /** 完整品牌名 */
  name: '和颐林·睡眠大师',
  /** 去掉间隔号的写法，用于标题后缀等紧凑位置 */
  shortName: '和颐林睡眠大师',
  /** 站点定位（需求文档 §1） */
  tagline: '睡眠健康知识与睡眠问题解决方案平台',
  description:
    '和颐林·睡眠大师官方网站。提供睡眠基础知识、常见睡眠问题的解答与免费睡眠自测，' +
    '帮助您认识自己的睡眠状况，找到更适合自己的改善方向。',
  locale: 'zh-CN',
  lang: 'zh-CN',
  /** 默认社交分享图 */
  defaultOgImage: '/og/default.jpg',
  /** 站点主题色，用于浏览器 UI 与 PWA */
  themeColor: '#0e2439',
  /**
   * 站点运营方。
   *
   * ⚠️ 这一项必须是 **ICP 备案主体**——本站备案号为「湘ICP备2026041138号-1」，
   * 属湖南备案，对应长沙康龄纪。备案主体与页面展示的运营方不一致会被判定为备案信息不实。
   *
   * Organization 结构化数据取的就是这一项：它描述的是「谁在运营这个网站」，
   * 而不是「这个产品属于谁」。
   */
  operator: {
    legalName: '长沙市康龄纪健康服务有限公司',
    /** 客服电话，同步用于 JSON-LD 的 Organization.telephone */
    telephone: '15580840138',
    /** 客服微信——不是邮箱，因此不写进 JSON-LD 的 email 字段 */
    wechat: 'haishifu2018',
    email: '',
  },

  /**
   * 品牌所有方（研发与生产）。
   *
   * 与运营方是两个不同的法律主体，不能混用：
   *  · 品牌与产品资料 → 北京和颐林
   *  · 网站运营与销售 → 长沙康龄纪
   * 产品结构化数据的 manufacturer 取这一项，brand 取站点品牌名。
   */
  brandOwner: {
    legalName: '北京和颐林生物科技有限公司',
    foundingYear: 2017,
  },
  /** 备案号：中国大陆服务器上线必须展示。留空则页脚不渲染该行。 */
  icp: process.env.NEXT_PUBLIC_ICP ?? '湘ICP备2026041138号-1',
} as const

// ---------------------------------------------------------------------------
// 内容署名（需求文档 §31）
// ---------------------------------------------------------------------------

/**
 * 署名登记表：frontmatter 里写 id，署名只在这里维护一份。
 *
 * 每篇文章底部要标明「谁写的、谁审的」，这两个名字还会进入 JSON-LD 的
 * author / reviewedBy（搜索引擎与 AI 搜索据此判断 E-E-A-T）。因此它们
 * 不能用内部 id 直接渲染——那会把 `heyilin-research-team` 这种串泄露给读者；
 * 也不该在每篇 frontmatter 里各写一遍——换人要翻十几处，且容易漏。
 *
 * 每位署名者有两个名字，用途不同，**不能混用**：
 *   - display：页面上给读者看的署名，可以带敬称（如「田宗高老师」）。
 *   - name：结构化数据里的姓名，必须是纯姓名。搜索引擎与 AI 搜索据此认定
 *     「这是谁」，塞进敬称会让实体名对不上，削弱 E-E-A-T 信号。
 * 取用时请走对应的访问器，不要自己从登记表里挑字段。
 */
export const CONTRIBUTORS = {
  authors: {
    'heyilin-research-team': {
      display: '和颐林睡眠研究团队',
      name: '和颐林睡眠研究团队',
    },
  },
  reviewers: {
    'tian-zonggao': {
      display: '田宗高老师',
      name: '田宗高',
    },
  },
} as const

/** 一位署名者的两种写法。 */
export interface Contributor {
  /** 页面展示用，可含敬称 */
  readonly display: string
  /** 结构化数据用，纯姓名 */
  readonly name: string
}

/** 文章未单独署名时使用的默认作者 / 资料审核人。 */
export const DEFAULT_AUTHOR_ID = 'heyilin-research-team'
export const DEFAULT_REVIEWER_ID = 'tian-zonggao'

function resolveContributor(
  registry: Readonly<Record<string, Contributor>>,
  id: string,
  kind: '作者' | '审核人',
): Contributor {
  const contributor = registry[id]
  if (!contributor) {
    // 未知 id 是 frontmatter 写错了。让构建失败，而不是把 id 当姓名渲染出去——
    // 内部标识泄露到公开页面比构建失败更难被发现。
    throw new Error(
      `[contributors] 未登记的${kind} id：「${id}」。请先在 lib/seo/site.ts 的 CONTRIBUTORS 中补上署名。`,
    )
  }
  return contributor
}

/** 页面署名的作者展示名；不传或传 undefined 时取默认作者。 */
export function getAuthorDisplayName(id?: string): string {
  return resolveContributor(CONTRIBUTORS.authors, id ?? DEFAULT_AUTHOR_ID, '作者').display
}

/** JSON-LD author 用的作者姓名（纯姓名）。 */
export function getAuthorSchemaName(id?: string): string {
  return resolveContributor(CONTRIBUTORS.authors, id ?? DEFAULT_AUTHOR_ID, '作者').name
}

/** 页面署名的审核人展示名；不传或传 undefined 时取全站默认审核人。 */
export function getReviewerDisplayName(id?: string): string {
  return resolveContributor(CONTRIBUTORS.reviewers, id ?? DEFAULT_REVIEWER_ID, '审核人').display
}

/** JSON-LD reviewedBy 用的审核人姓名（纯姓名）。 */
export function getReviewerSchemaName(id?: string): string {
  return resolveContributor(CONTRIBUTORS.reviewers, id ?? DEFAULT_REVIEWER_ID, '审核人').name
}

const DEFAULT_DEV_ORIGIN = 'http://localhost:3000'

let warnedAboutOrigin = false

/**
 * 解析站点 origin。
 *
 * 静态导出会把 origin **烘进每一页 HTML**（canonical / sitemap / JSON-LD），构建后无法再修正。
 * 所以把关必须发生在构建之前：scripts/check-env.ts 会在生产构建时硬性拦截缺失或错误的取值
 * （已接入 prebuild，本地与 CI 都会跑）。
 *
 * 这里保留 localhost 降级是为了让 `npm run dev` 和本地预览能跑起来。
 * 生产构建若走到这一行，说明 check-env 没有拦住——那是需要修的 bug，不是预期行为。
 */
export function getSiteOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (configured) {
    return configured.replace(/\/+$/, '')
  }

  // 构建期每个 worker 都是独立进程，模块级标志挡不住重复输出，因此只保留一行提示。
  if (process.env.NODE_ENV === 'production' && !warnedAboutOrigin) {
    warnedAboutOrigin = true
    console.warn(
      '[seo] 未设置 NEXT_PUBLIC_SITE_URL，canonical/sitemap 正在使用 localhost:3000。' +
        '生产构建不应出现这行——scripts/check-env.ts 会拦住它。',
    )
  }

  return DEFAULT_DEV_ORIGIN
}

/** 是否仍在使用占位域名。 */
export function isUsingPlaceholderOrigin(): boolean {
  return !process.env.NEXT_PUBLIC_SITE_URL?.trim()
}

/**
 * URL 形态：true = 带尾斜杠（/about/）。
 *
 * ⚠️ 必须与 next.config.ts 的 trailingSlash 保持一致。两处不一致会让 canonical
 * 与实际服务的 URL 形态不符，而且**不会报错**。两边都写成硬编码常量，
 * 就是为了杜绝「一边读环境变量、一边读常量」造成的静默错配。
 *
 * 选带尾斜杠的原因见 next.config.ts：静态产物是 about/index.html，任何主机零配置即可服务；
 * 不带斜杠的形态依赖伪静态规则，配不上则除首页外全部 404。
 */
const TRAILING_SLASH = true

/**
 * 把路径规范成当前服务的形态。
 *
 * 末段含 "." 的一律视为文件（/sitemap.xml、/og/default.jpg、/llms.txt），
 * 给它们加斜杠会直接 404——它们不是页面路由。
 */
function applyTrailingSlash(pathname: string): string {
  if (!TRAILING_SLASH) return pathname.replace(/\/+$/, '') || '/'

  const lastSegment = pathname.split('/').pop() ?? ''
  if (lastSegment.includes('.')) return pathname

  return pathname.endsWith('/') ? pathname : `${pathname}/`
}

/**
 * 把站内路径解析为绝对地址。已是绝对地址的原样返回。
 *
 * 这是全站**唯一**的 URL 形态归一化点：metadata.ts / sitemap.ts / jsonld.ts 都经由它，
 * 因此结构上不可能出现 canonical 与 sitemap 形态不一致。
 *
 * lib/seo/routes.ts 里存的是逻辑路由 id（不带斜杠），不要在那里加斜杠——
 * 那会制造第二个出错点，也会破坏 sitemap.ts 里 `section.path === '/product'` 这类比较。
 */
export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl

  const origin = getSiteOrigin()
  const normalized = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`
  return `${origin}${applyTrailingSlash(normalized)}`
}

/** 当前生效的 origin。 */
export const SITE_ORIGIN = getSiteOrigin()
