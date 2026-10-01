# 部署到阿里云虚拟主机

站点是**纯静态导出**（`output: 'export'`）：`npm run build` 产出 `out/` 目录，
把它整体上传到虚拟主机的网站根目录即可。没有任何服务端进程需要启动。

唯一的动态能力是联系表单，由 `out/api/leads.php` 承接（PHP 是虚拟主机原生支持的）。

---

## 0. 主机情况（已经确认过的事实）

`101.200.181.73` 是**阿里云云虚拟主机（万网虚机）**，不是 ECS：

- 22 / 2222 / 22222 / 2022 端口**全部关闭**——共享主机不提供 SSH
- 直接访问 IP 会被 `wanwang.aliyun.com/hosting/ipvisit_stop` 拦截页接管，这是虚拟主机专属行为
- 80 / 443 由虚拟主机控制面板应答

**这意味着不能在上面跑 Node 进程**，所以项目从 PM2 + Nginx 改成了纯静态 + PHP。
备案不受影响：虚拟主机本身就是有效的备案接入方式。

---

## 1. 构建

```bash
# 必须用 Node 24 LTS
export PATH="/c/Users/Administrator/AppData/Local/nvm/v24.15.0:$PATH"
npm run build
```

构建会自动先跑 `prebuild`（内容校验 + 环境变量检查）。**若 `NEXT_PUBLIC_SITE_URL`
缺失或指向 localhost，构建会被拒绝**——这是刻意的：静态站的地址烘在每一页 HTML 里，
构建后再发现就只能重新构建。

产物在 `out/`。上传的是 `out/` **里面的内容**，不是 `out/` 目录本身。

---

## 2. 上传顺序（重要）

**务必按这个顺序，反过来会让联系表单先失效：**

```
① klj-private/config.php     ← 服务器端配置，含盐值
② htdocs/api/leads.php       ← 线索接口
③ htdocs/ 下的其余全部        ← 静态站（out/ 的内容）
```

如果先传了静态站，页面上的表单会指向一个还不存在的接口，访客提交会直接报错。
反过来先传接口则无害（此时还没有页面引用它）。

---

## 3. 目录布局

阿里云虚拟主机的网站根目录通常是 FTP 根的 `htdocs` 子目录：

```
<FTP 根>/
├── htdocs/                    ← 网站根目录，公开可访问。上传 out/ 的内容到这里
│   ├── index.html
│   ├── about/index.html
│   ├── api/leads.php          ← 线索接口
│   ├── _next/                 ← 构建产物
│   ├── images/  brand/  og/
│   ├── robots.txt  sitemap.xml  llms.txt  404.html
│   └── ...
└── klj-private/               ← 网站根目录**之外**，无法通过 URL 访问
    ├── config.php             ← 盐值与路径
    ├── leads.jsonl            ← 线索数据（自动生成）
    └── ratelimit.json         ← 限流状态（自动生成）
```

**为什么线索数据必须放在 `htdocs` 之外**：里面有访客的手机号和微信号，
属于《个人信息保护法》保护的个人信息。放在网站根目录内就意味着任何人猜到路径
都能直接下载整个文件。

### 如果你的主机没有 `htdocs` 子目录

有些套餐的 FTP 根目录**就是**网站根目录。这时：

- `klj-private/` 建在 FTP 根的**上一级**（如果 FTP 账号有权限），或
- 退而求其次：把 `klj-private` 建在 FTP 根里，然后在控制台里确认无法通过 URL 访问
  （访问 `https://域名/klj-private/config.php` 应当 404 或返回空白）

无论哪种情况，都要改 `htdocs/api/leads.php` 开头那一行：

```php
$configPath = __DIR__ . '/../../klj-private/config.php';
```

`__DIR__` 是 `htdocs/api`，所以 `../../` 指向 FTP 根再往上一级。
若目录层级不同，按实际结构调整这一行即可——**这是整个文件里唯一与主机相关的部分**。

---

## 4. 服务器端配置

把 `deploy/config.example.php` 复制为 `klj-private/config.php` 并填写。

**盐值必须换成随机长字符串**，生成方式任选：

```bash
# 本地生成一个
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

盐值不要进版本库、不要写进任何前端文件。它是 IP 哈希的唯一盐，
泄露它等于让加盐哈希失去意义（原始 IP 理论上可被暴力反查）。

> 注意：`lib/leads/store.ts` 与 `public/api/leads.php` 是同一套逻辑的两份实现
> （前者保留作对照规范，后者是生产实现）。改动其一时请同步另一份。

---

## 5. 绑定域名

两处都要配，缺一不可：

1. **虚拟主机控制台 → 域名绑定**：添加 `www.kanglingji.com`
   （如需裸域名 `kanglingji.com` 也能访问，一并添加）
2. **阿里云云解析 DNS**：给 `www` 加一条 **A 记录**指向 `101.200.181.73`

用 A 记录而不是 CNAME——虚拟主机给的是固定 IP。

> ⚠️ **不要把这个域名指向境外主机（Vercel 之类）。** 备案是绑定接入商的：
> `湘ICP备2026041138号-1` 通过阿里云办理，要求域名解析到中国大陆境内且已接入的服务器。
> 指向境外构成备案信息不实，阿里云扫描到会下发整改、逾期可注销备案。

---

## 6. 主机侧可选配置

站点的安全响应头和 404 页原先由 `next.config.ts` 的 `headers()` 提供，
但静态导出下它**只会产生一条构建警告然后静默失效**，所以已删除。要恢复只能在主机侧配。

在虚拟主机控制台的**伪静态设置**里尝试（语法视套餐而定，nginx 与 Apache 都列在下面）：

```nginx
# 404 页
error_page 404 /404.html;

# 安全响应头
add_header X-Content-Type-Options nosniff always;
add_header X-Frame-Options SAMEORIGIN always;
add_header Referrer-Policy strict-origin-when-cross-origin always;
add_header X-DNS-Prefetch-Control on always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), interest-cohort=()" always;
```

```apache
ErrorDocument 404 /404.html
Header set X-Content-Type-Options nosniff
Header set X-Frame-Options SAMEORIGIN
Header set Referrer-Policy strict-origin-when-cross-origin
```

**如果控制台拒绝这些指令，就接受这部分丢失。** 它们是安全加固，不影响站点功能，
不要为了配上它们去改 URL 形态或换主机方案。

**URL 形态不需要任何伪静态规则**：本项目用带尾斜杠形态（`/about/`），
产物是 `about/index.html`，任何主机的目录索引规则都能正确服务。

---

## 7. 验证清单

部署完成后逐条确认：

- [ ] `https://www.kanglingji.com/` 打开正常
- [ ] 子页面可访问，且**带尾斜杠**：`/about/`、`/knowledge/what-is-deep-sleep/`、`/product/faq/`
- [ ] 不带斜杠的 `/about` 会 301 跳到 `/about/`（主机的默认行为）
- [ ] 页面源码里的 `<link rel="canonical">` 是 `https://www.kanglingji.com/.../`
- [ ] `https://www.kanglingji.com/sitemap.xml` 可访问且地址带尾斜杠
- [ ] `https://www.kanglingji.com/robots.txt` 的 `Host` 与 `Sitemap` 指向正式域名
- [ ] 页脚显示备案号 `湘ICP备2026041138号-1`
- [ ] 随便访问一个不存在的地址，显示的是**本项目的 404 页**而不是主机默认页
- [ ] **联系表单能提交成功**（在 `/contact/` 填一次测试数据）
- [ ] **线索文件无法通过 URL 下载**：访问 `https://www.kanglingji.com/klj-private/leads.jsonl`
      和 `.../api/leads.php`（GET）应当都拿不到数据

### 验证线索真的写进去了

没有 SSH，所以要用控制台的**文件管理**功能：

1. 阿里云控制台 → 云虚拟主机 → 文件管理
2. 进入 `klj-private/`，打开 `leads.jsonl`
3. 应当能看到刚才提交的那条记录（一行一条 JSON）

如果表单返回成功但文件里没有记录，说明 `config.php` 里的 `leads_file` 路径不对。

---

## 8. 收回线索

`leads.jsonl` 是**一行一条 JSON** 的纯文本：

```json
{"nickname":"张三","phone":"13800138000","source":"direct","landingPage":"/contact/","consent":{"privacyAccepted":true,"acceptedAt":"2026-10-01T13:32:09.121Z","policyVersion":"v1"},"meta":{"userAgent":"..."},"id":"01M3VTMM11QF82JXTGQMEJGQ3G","consultationStatus":"new","createdAt":"...","updatedAt":"...","ipHash":"..."}
```

用控制台的文件管理下载即可。

- `id` 是 ULID，前缀含时间，按字典序即按时间序
- `ipHash` 是 `sha256(盐 + ":" + 原始IP)`，**不可逆**，只用于风控
- 手机号与微信号**不会**出现在任何服务器日志里

---

## 9. 日常维护

**改内容或改代码之后**：重新 `npm run build`，把 `out/` 的内容重新上传覆盖。
`klj-private/` 不在 `out/` 里，所以**重新上传永远不会动到线索数据**——
这是把数据放在网站根目录之外带来的另一个好处。

**表单突然失效**：先确认 `htdocs/api/leads.php` 和 `klj-private/config.php` 都还在。
重新上传静态站覆盖了 `leads.php` 是正常的，但只要传的是最新构建产物就没问题。

**提交返回「提交过于频繁」**：限流是 10 分钟 5 次（按 IP）。正常访客不会触发；
如果误伤，删掉 `klj-private/ratelimit.json` 即可重置。

---

## 10. 本机验证（可选）

部署前想先本地确认接口行为，需要本机有 PHP：

```bash
# 模拟主机布局
mkdir -p /tmp/klj/htdocs/api /tmp/klj/klj-private
cp public/api/leads.php /tmp/klj/htdocs/api/
cp deploy/config.example.php /tmp/klj/klj-private/config.php   # 填好盐值

cd /tmp/klj && php -S 127.0.0.1:8899 -t htdocs

# 另开一个终端
curl -X POST http://127.0.0.1:8899/api/leads.php \
  -H 'Content-Type: application/json' \
  -d '{"phone":"13800138000","source":"direct","landingPage":"/contact/","consent":{"privacyAccepted":true,"policyVersion":"v1"}}'
```

预期返回 `{"ok":true,"id":"..."}`，且 `/tmp/klj/klj-private/leads.jsonl` 里多一行。

> 注意 `php -S` 只是开发服务器，用来验证接口逻辑；它不模拟虚拟主机的目录索引与
> 伪静态行为。静态站的解析行为用 `npm run start` 验证（见项目根 README）。
