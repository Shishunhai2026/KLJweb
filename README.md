# 和颐林·睡眠大师 官方网站 V1.0

睡眠健康知识平台 + 睡眠自测 + 产品资料中心。
**不是一个产品广告站**——这是需求文档反复强调的定位，也是本项目所有设计决策的出发点。

> **注**：原计划的「AI 睡眠助手」栏目已按客户要求移除，
> 相关的页面、接口与实现代码均已删除。详见文末「已移除的功能」。

---

## 快速开始

```bash
# 1. 必须使用 Node 24 LTS（见下方「环境要求」）
export PATH="/c/Users/Administrator/AppData/Local/nvm/v24.15.0:$PATH"

npm install
npm run dev        # 开发：http://localhost:3000
npm run build      # 生成静态产物到 out/
npm run start      # 本地预览 out/（http://localhost:3200）
```

> 本项目是**纯静态导出**（`output: 'export'`）。`out/` 目录就是最终交付物，
> 整体上传到虚拟主机，没有任何服务端进程。部署步骤见 [deploy/README.md](deploy/README.md)。

### 常用命令

| 命令 | 作用 |
|------|------|
| `npm run verify` | 一次跑完 typecheck + lint + 单测 + 内容校验（提交前必跑） |
| `npm run content:lint` | 只校验内容：Schema、站内链接图、违禁表述、数字回溯 |
| `npm run test` | 单元测试（147 个，覆盖计分/护栏/Schema） |
| `npm run check:links` | **爬站内全部链接查死链**（需先启动服务） |
| `npm run preview:shots` | 自动截图全部关键页面到 `.preview/`（需先启动服务） |
| `npm run lint` / `npm run typecheck` | 代码检查 |

线上检查与截图需要服务在跑：

```bash
npm run build && npm run start     # 另开一个终端；start 服务的是 out/ 静态产物
npm run check:links                # 死链检查
npm run preview:shots              # 生成预览截图
```

> `npm run start` 服务的是 `out/`，端口 3200（与 check-links 和截图脚本的默认值一致）。
> 它模拟虚拟主机的解析行为：目录索引、缺尾斜杠 301、404 页。

---

## ⚠️ 环境要求（重要，排查了很久）

**1. 必须用 Node 24 LTS，不能用 Node 25。**

Node 25 是奇数版非 LTS，会让 Next 构建在预渲染内置错误页时随机崩溃：

```
Invariant: Expected workStore to be initialized
TypeError: Cannot read properties of null (reading 'useContext')
```

报错页面每次不同（`/_global-error`、`/_not-found`、`/404`、`/500`），看起来像业务代码 bug，实际是运行时问题。
Node 24.15.0 已装在 nvm 下（`C:\Users\Administrator\AppData\Local\nvm\v24.15.0`）。

> 注意：`nvm use` 在这台机器上会报「成功」但实际不生效——因为 Node 25 是官方安装包装的，
> 位于 `C:\Program Files\nodejs`，nvm 覆盖不了它。请用上面 `export PATH=...` 的方式。

**2. `package.json` 里的 dev/build 脚本刻意写成直连形式，不要改回 `next build`。**

```json
"build": "node node_modules/next/dist/bin/next build"
```

原因：npm 在 Windows 上生成的 `node_modules/.bin/next.cmd` 垫片会干扰 Next 的构建 worker
（垫片里有 `title %COMSPEC%` 与 `PATHEXT` 改写）。走垫片必崩，直连必过。
这一点已反复验证：`npm run build` 失败，`node node_modules/next/dist/bin/next build` 成功。

（`start` 已不再是 `next start`——静态导出下它无法服务站点。现在指向
`scripts/serve-out.mjs`，一个零依赖的本地静态服务器，与 Next 的构建 worker 无关。）

---

## 项目结构

```
content/                    ← 全部内容。没有数据库，运营可用文本编辑器直接改
  articles/                 文章（MDX：frontmatter 结构化字段 + 正文）
  sleep-problems/           睡眠问题专题（YAML）
  product-knowledge/        产品资料（MDX）
  knowledge-base/           结构化睡眠问答（YAML）
  _guardrails/              ★ 违禁表述规则（内容校验在用）
app/                        页面（静态导出，无服务端路由）
components/                 UI 组件（layout / geo / article / isi / lead / ui）
lib/
  content/                  ★ 内容 Schema 与加载器（构建失败闸门在这里）
  isi/                      睡眠自测量表与计分
  ai/guardrails/            违禁表述扫描（由 content:lint 使用）
  seo/                      统一 metadata、JSON-LD、面包屑
  leads/                    线索记录结构（生产实现是 public/api/leads.php，此处为对照规范）
public/api/leads.php        ★ 线索接口（PHP）。静态站唯一的动态能力
deploy/                     部署文档与服务器端配置样例
scripts/                    validate-content / check-env / serve-out / check-links / prepare-assets
```

---

## 核心设计

### 1. 内容即构建闸门

`lib/content/schemas/` 用 Zod 定义所有内容的形状。任何一篇内容不合法（FAQ 少于 5 个、
相关文章少于 3 篇、引用了不存在的来源、企业资料被标成独立核验……）都会让**构建直接失败**，
而不是产出一个「看起来正常但缺字段」的页面。

这是让 300 篇由大模型生成的文章变得安全的前提。

### 2. 证据分级（`lib/content/evidence.ts`）

全站唯一真源。每个等级定义「可否作为事实陈述」「是否必须渲染核验标记」：

| 等级 | 含义 | 处理方式 |
|------|------|----------|
| L1 | 公开医学/科研机构资料 | 可作为事实陈述 |
| L2 | 公开发表研究 | 可作为事实陈述，须标明局限 |
| L3 | 产品相关研究 | 必须标注「企业提供资料，待独立核验」 |
| L4 | 企业检测报告 | 同上，并注明报告自身的使用限制 |
| L5 | 企业宣传资料 | 不得作为医学结论引用 |
| L6 | 用户体验 | 不构成产品功效保证 |

### 3. 违禁表述是数据不是代码（`content/_guardrails/`）

`content/_guardrails/forbidden-claims.yaml` 定义了绝对禁用词（治愈、根治、抗癌…）、
语境禁用词与正则模式（`N% 有效率`、`N 天见效` 等）。

`content:lint` 会用它扫描每篇文章的 Quick Answer 与核心结论、
以及产品正文，命中即**阻断构建**。改规则只需改 YAML，不必改代码。

### 4. 证据等级与合规提示

产品页的每个数值都必须登记在 `claims` 字段并标注来源与核验状态；
正文里出现未登记的「数字 + %/例/U/袋」会被 `content:lint` 直接拦下。

---

## 从原始资料中核实的关键问题（影响内容取舍）

| # | 发现 | 处理 |
|---|------|------|
| **F1** | 产品定位为**特殊膳食**，按法规**不得宣称保健功能**。但《产品全解》含「治疗失眠症总有效率93.3%」「与苯二氮卓类药物相当」等表述 | 全部隔离进受控字段并标注核验状态，不进正文。**建议客户在合规审核后再对外发布** |
| **F2** | 四大临床、8项专利、四酶检测等 PDF 是**纯扫描件**，无可提取文本 | 只能标 L5，不能当作 L2/L3 的公开研究 |
| **F3** | 《产品全解》**自相矛盾**：SOD 活性同时写了 **3320 U** 与 **332 U** | ✅ **已解决**：经客户确认以 **3320 U** 为准。页面按 3320 U 展示，并在说明中保留这段出入记录，让数据变化有迹可循 |
| **F4** | 检测报告自身注明**「报告内容不得用于商业广告」** | 检测页只列项目/结果，不上传报告截图；本页也解释了为什么找不到「检测报告大图」 |
| **F5** | 两处用户反馈问题：一条是「已经不服用安眠药了」（等同鼓励停药），另一页混入了**无关的房产数据** | 前者不采用；后者删除。反馈页当前留空并说明原因，**不编造任何用户反馈** |

---

## 已完成的配置

- ✅ **域名**：`https://www.kanglingji.com`（已在 `.env` 中设置 `NEXT_PUBLIC_SITE_URL`）。
  全站 canonical、sitemap、JSON-LD 均已指向该域名，无 localhost 残留。
- ✅ **备案号**：`湘ICP备2026041138号-1`，已显示在页脚并链接到工信部备案系统。
- ✅ **客服微信**：`haishifu2018`（页脚 + 联系页，联系页为可选中文本便于复制）。
- ✅ **客服电话**：`15580840138`（页脚 + 联系页，可点击拨号）。
- ✅ **F3 已解决**：SOD 活性按客户确认的 **3320 U** 展示。

## ⚠️ 品牌所有方与运营方是两个不同主体

这一区分贯穿页脚、法务页与结构化数据，**不要合并**：

| 角色 | 主体 | 职责 | 在站内的体现 |
|------|------|------|--------------|
| **品牌所有方** | 北京和颐林生物科技有限公司 | 商标与产品研发、生产（成立于 2017 年） | `Product.manufacturer`、`Organization.parentOrganization`、页脚「品牌所有」 |
| **站点运营方** | 长沙市康龄纪健康服务有限公司 | 网站运营、销售与售后 | `Organization.legalName`、页脚版权署名、隐私政策中的「我们」 |

**为什么必须分开**：本站备案号是**「湘」字头（湖南）**，对应备案主体为长沙康龄纪；
而「和颐林睡眠大师」品牌归北京和颐林。备案主体与页面展示的运营方不一致，
会被判定为备案信息不实。因此 `Organization` 结构化数据取的是**运营方**，产品数据的
`manufacturer` 取的是**品牌所有方**。

两处定义都在 `lib/seo/site.ts`（`SITE.operator` 与 `SITE.brandOwner`），改一处即全站生效。

## 上线前仍需完成（客户侧）

1. **配置盐值与线索存储路径**。静态站没有 Node 运行时，所以这两个值**不在 `.env`**，
   而是在服务器的 `klj-private/config.php`（位于网站根目录之外，无法通过 URL 下载）。
   盐值必须替换为随机长字符串——它是 IP 哈希的唯一盐值。见 [deploy/README.md](deploy/README.md)。

2. **合规复核 F1**。产品定位为特殊膳食，涉及广告法与《食品安全法》的宣称边界，
   建议由法规顾问逐条确认产品页的可发布口径。
   应急开关：`content/_taxonomy/claims-policy.yaml`（可一次性把全站 L3+ 表述降级为中性措辞）。

3. **用户反馈素材**：提供取得授权、可公开发布的素材，并逐条合规复核后填入
   `app/testimonials/page.tsx`（当前留空并说明了原因，未编造任何内容）。

4. **接入统计**：GA4 / 百度统计 / Clarity 的 ID 填入 `.env`（组件已预留，留空则自动跳过）。

5. **配置 `BAIDU_PUSH_TOKEN`** 以启用百度普通收录推送（备案已完成，可以启用）。

6. **部署**：见 [deploy/README.md](deploy/README.md)。`npm run build` 产出 `out/`，
   把它的**内容**（不是 `out/` 目录本身）上传到虚拟主机的网站根目录。
   注意上传顺序：**先传 `config.php` 与 `leads.php`，再传静态站**——反过来会让联系表单先失效。


---

## 待补充内容

当前已交付站点完整框架 + **9 篇高质量文章 + 5 个睡眠问题专题 + 2 条产品资料**。

需求文档规划了 300 篇文章（§27）。剩余的批量生产建议：
- 用 `content/_plan/topics.yaml` 中的选题清单
- 生成脚本产出 `status: draft` + `needsMedicalReview: true`
- **必须经人工审核后才可改为 `published`** —— 内容资产的价值完全取决于这个关口

现有内容的写作标准可作为模板参考：Quick Answer 保持中立（不带产品）、
FAQ 至少 5 个、每篇链接 3 篇相关文章 + 1 个睡眠问题专题。

---

## 技术栈

Next.js 16（App Router，SSG 为主）· React 19 · TypeScript 5.9 · Tailwind CSS 4 ·
Zod 4 · Vitest 5 · 无数据库（内容为文件）

**部署**：`output: 'export'` 纯静态导出，产物 `out/` 整体上传到阿里云虚拟主机。
站点没有任何服务端进程；唯一的动态能力（线索提交）由 `public/api/leads.php` 承接。
URL 采用**带尾斜杠**形态（`/about/`），这样在任何主机上零配置即可正确服务——
不带斜杠的形态依赖伪静态规则，配不上会导致除首页外全部 404。详见 [deploy/README.md](deploy/README.md)。

---

## 已移除的功能：AI 睡眠助手

按客户要求，原计划的「AI 睡眠助手」栏目已整体移除。

**已删除**：

| 路径 | 内容 |
|------|------|
| `app/ai-sleep-assistant/` | 助手页面 |
| `app/api/ai/chat/` | 对话接口 |
| `components/ai/` | 聊天界面组件 |
| `lib/ai/compose/` `intent/` `llm/` `retrieval/` | 回答合成、意图识别、模型适配、知识检索 |

**同时清理的入口**：主导航、页脚「工具与助手」栏、首页独立板块、
睡眠自测结果页的「与 AI 助手聊聊」CTA、sitemap、面包屑配置。

### 仍然保留的部分

`lib/ai/guardrails/` 与 `content/_guardrails/` **刻意保留**，因为它仍在为内容校验服务：

- `content/_guardrails/forbidden-claims.yaml` 被 `npm run content:lint` 使用，
  负责扫描文章与产品正文中的违禁表述（治愈、根治、`N% 有效率` 等），命中即阻断构建
- 这是本项目的合规资产，与 AI 助手是否存在无关

`emergency-terms.yaml`（急症升级话术）与 `canonical-refusals.yaml`（用药问题的固定回复）
目前处于休眠状态，随 AI 功能一并停用。**如果将来要重新上线 AI 助手，
这套规则可以直接复用，不需要重写。**

### 睡眠自测结果页的变化

移除 AI 入口后，结果页的区块顺序变为：

```
当前睡眠情况 → 可能突出的方面 → 推荐阅读 → 改善建议 → 和颐林睡眠大师（始终最后）
```

「产品永远排在最后」这条契约由单元测试断言，未受影响。
