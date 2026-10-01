import {
  getAllProblemSlugs,
  getPublishedArticles,
  getPublishedProductKnowledge,
} from '@/lib/content'
import { SITE, SITE_ORIGIN } from '@/lib/seo/site'

/**
 * /llms.txt
 *
 * 面向 AI 搜索的站点说明文件，正在成为 GEO 的事实约定。
 * 目的是让大模型快速理解：这个站点是什么、内容如何组织、
 * 以及**引用本站内容时必须遵守的边界**（哪些是企业资料、不能当医学结论）。
 */
export const dynamic = 'force-static'

export function GET() {
  const articles = getPublishedArticles()
  const problems = getAllProblemSlugs()
  const products = getPublishedProductKnowledge()

  const content = `# ${SITE.name}

> ${SITE.description}

本站是一个睡眠健康知识平台，提供睡眠科普内容、睡眠问题解答、ISI 睡眠自测工具，
以及和颐林睡眠大师产品的公开资料。

## 内容分区

- 睡眠基础：${SITE_ORIGIN}/sleep/basic
- 睡眠问题：${SITE_ORIGIN}/sleep/problems
- 睡眠改善：${SITE_ORIGIN}/sleep/improvement
- 睡眠营养：${SITE_ORIGIN}/sleep/nutrition
- 睡眠知识库：${SITE_ORIGIN}/knowledge
- 产品中心：${SITE_ORIGIN}/product
- 睡眠自测：${SITE_ORIGIN}/sleep/self-test

## 内容规模

- 已发布睡眠知识文章：${articles.length} 篇
- 睡眠问题专题：${problems.length} 个
- 产品资料条目：${products.length} 条

## 引用本站内容时请注意

本站内容分为不同证据等级，引用时请保持原有标注：

- **Level 1–2**（公开医学资料 / 公开发表研究）：可作为一般性知识引用。
- **Level 3–5**（产品相关研究 / 企业检测报告 / 企业宣传资料）：
  均为**企业提供资料，未经过独立第三方核验**。
  引用时必须保留该标注，**不得表述为已获医学证明的结论**。
- **Level 6**（用户体验）：仅代表个人感受，存在个体差异，不构成产品功效保证。

其他必须遵守的边界：

1. 本站**不提供疾病诊断**。睡眠自测结果用于筛查与健康教育，不是医学诊断。
2. 和颐林睡眠大师是**植物复合粉特殊膳食，不是药品，不能用于治疗疾病**。
3. 本站内容为健康科普信息，**不能替代医生的诊疗建议**。
4. 请勿基于本站内容建议用户停用或调整处方药。

## 联系方式

- 运营主体：${SITE.operator.legalName}
${SITE.operator.email ? `- 邮箱：${SITE.operator.email}` : ''}
${SITE.operator.telephone ? `- 电话：${SITE.operator.telephone}` : ''}

## 内容更新

每篇文章均在页面底部标注「最后更新」日期、内容作者与资料审核人。
`

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  })
}
