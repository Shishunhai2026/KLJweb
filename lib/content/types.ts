/**
 * 内容数据模型。
 *
 * 所有类型都由 lib/content/schemas 下的 Zod Schema 推导而来，
 * 因此编译期类型与运行期校验永远不会背离——改一处即可，不存在两处定义不同步的问题。
 */

export type {
  ContentStatus,
  FaqItem,
  Intent,
  KeyFact,
  RobotsDirective,
  SeoFields,
  SourceRef,
} from './schemas/common'

export type { Article, ArticleInput } from './schemas/article'
export type { SleepProblem } from './schemas/problem'
export type { ProductClaim, ProductKnowledge } from './schemas/product'
export type { KnowledgeBaseEntry } from './schemas/knowledge'
export type {
  ConsultationStatus,
  LeadRecord,
  LeadSource,
  LeadSubmission,
} from './schemas/lead'

export type {
  ArticleCategory,
  KbCategory,
  ProductSection,
  SleepProblemCategory,
} from './taxonomy'

export type { EvidenceLevel } from './evidence'

export type { SeverityBand } from '../isi/bands'
