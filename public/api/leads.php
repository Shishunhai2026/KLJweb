<?php

declare(strict_types=1);

/**
 * 线索提交接口 —— 静态站部署在共享虚拟主机上的后端实现。
 *
 * 为什么是 PHP：站点以 `output: 'export'` 产出纯静态文件，部署到阿里云虚拟主机。
 * 共享虚拟主机没有常驻 Node 进程，所以原来的 Route Handler（app/api/leads/route.ts）
 * 无法随静态导出一起生成。PHP 是虚拟主机原生支持的，用来承接这唯一一个动态能力。
 *
 * 对照规范（改了这里也要改那边，反之亦然）：
 *   · lib/content/schemas/lead.ts —— 校验规则
 *   · lib/leads/store.ts          —— 记录结构、哈希算法
 *
 * 隐私要求（《个人信息保护法》）：
 *   · 必须提交隐私政策同意（consent.privacyAccepted 必须严格为布尔 true）
 *   · 只存加盐 SHA-256 后的 IP 哈希，绝不存原始 IP
 *   · 手机号、微信号不进入任何日志
 *
 * ⚠️ 部署顺序：先传本文件 + 外部 config.php，再传静态站。
 *    反过来会让表单先失效（页面已指向 /api/leads.php 但文件还不存在）。
 */

// 任何 PHP 警告/提示都不得混进 JSON 响应体，否则前端 response.json() 解析失败
ini_set('display_errors', '0');
error_reporting(E_ALL);

const RATE_LIMIT = 5;
const RATE_WINDOW_SECONDS = 600; // 10 分钟
const MAX_BODY_BYTES = 20000;    // 原实现没有上限，这里补上
const RATE_FILE_MAX_ENTRIES = 5000;

const ERR_TOO_MANY = '提交过于频繁，请稍后再试。';
const ERR_BAD_FORMAT = '请求格式不正确。';
const ERR_INVALID = '提交的信息有误，请检查后重试。';
const ERR_SAVE_FAILED = '提交失败，请稍后再试，或通过页面上的微信联系方式与我们联系。';

/** 与 lib/content/schemas/lead.ts 的 leadSourceSchema 一致 */
const LEAD_SOURCES = ['google', 'baidu', 'xiaohongshu', 'douyin', 'wechat', 'direct', 'ai_search', 'other'];

/** 与 severityBandSchema 一致 */
const SEVERITY_BANDS = ['none', 'subthreshold', 'moderate', 'severe'];

/** 中国大陆手机号。⚠️ 不加 /u —— 加上后 \d 可能匹配非 ASCII 数字，而 JS 的 \d 只匹配 ASCII。 */
const CN_PHONE_REGEX = '/^1[3-9]\d{9}$/';

/** 微信号：字母开头，可含字母、数字、下划线、连字符 */
const WECHAT_REGEX = '/^[a-zA-Z][a-zA-Z0-9_-]{5,19}$/';

/** 内容 slug */
const SLUG_REGEX = '/^[a-z0-9]+(?:-[a-z0-9]+)*$/';

/* -------------------------------------------------------------------------- */
/* 字符串工具                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * 按 Unicode 码点数计长度，近似 JS 的 String.prototype.length。
 *
 * 优先用 mbstring，未安装时退化为 UTF-8 感知的 preg 计数。
 * **刻意不做硬依赖**：虚拟主机的 PHP 扩展配置无法预先确认，而 mbstring 缺失会让
 * 整个接口致命错误——表单是这个站点唯一的获客入口，不能拿它去赌一个扩展是否开启。
 *
 * 与 JS 的差异仅出现在基本平面之外的字符（emoji 等）：JS 计 2，这里计 1。
 * 本接口的字段要么是 URL 路径要么是中日韩文字（都在基本平面），影响可忽略。
 */
function str_len(string $value): int
{
    if (function_exists('mb_strlen')) {
        return mb_strlen($value, 'UTF-8');
    }

    $count = preg_match_all('/./us', $value);

    return $count === false ? strlen($value) : $count;
}

/** 按 Unicode 码点截断，避免从中间切断一个 UTF-8 字符。 */
function str_cut(string $value, int $max): string
{
    if (function_exists('mb_substr')) {
        return mb_substr($value, 0, $max, 'UTF-8');
    }

    if (preg_match('/^.{0,' . $max . '}/us', $value, $matches) === 1) {
        return $matches[0];
    }

    return substr($value, 0, $max);
}

/* -------------------------------------------------------------------------- */
/* 入口                                                                        */
/* -------------------------------------------------------------------------- */

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    respond(405, ['error' => ERR_INVALID]);
}

/**
 * 服务器端配置（盐 + 数据文件路径）**不在仓库里**，放在 Web 根目录之外，
 * 因此无法通过 URL 下载。见 deploy/README.md。
 */
$configPath = __DIR__ . '/../../klj-private/config.php';
if (!is_file($configPath)) {
    // 配置缺失时绝不降级运行：没有盐就无法兑现「绝不存原始 IP」，没有路径就无法落盘。
    // 这里只记日志、对客户端返回通用错误，不泄露服务器路径。
    error_log('[leads] 缺少配置文件 klj-private/config.php，拒绝服务');
    respond(500, ['error' => ERR_SAVE_FAILED]);
}

/** @var array{ip_hash_salt:string, leads_file:string, ratelimit_file:string} $config */
$config = require $configPath;

$ip = client_ip();

// 限流：固定窗口。计数键与存储哈希做域分离（:rl:），
// 避免限流文件里出现与 ipHash 相同的值。
if ($ip !== '') {
    $salt = trim((string) ($config['ip_hash_salt'] ?? ''));
    $bucketKey = hash('sha256', ($salt === '' ? '' : $salt . ':') . 'rl:' . $ip);
    if (rate_limited($bucketKey, (string) $config['ratelimit_file'])) {
        respond(429, ['error' => ERR_TOO_MANY]);
    }
}

$raw = file_get_contents('php://input', false, null, 0, MAX_BODY_BYTES);
if ($raw === false || $raw === '') {
    respond(400, ['error' => ERR_BAD_FORMAT]);
}

$input = json_decode($raw, true);
if (!is_array($input)) {
    respond(400, ['error' => ERR_BAD_FORMAT]);
}

$errors = validate($input);
if ($errors !== []) {
    respond(400, ['error' => ERR_INVALID, 'fields' => $errors]);
}

$now = iso_now();
$record = build_record($input, $now, hash_ip($ip, trim((string) ($config['ip_hash_salt'] ?? ''))));

if (!append_jsonl((string) $config['leads_file'], $record)) {
    error_log('[leads] 写入失败：' . $record['id'] . '（来源 ' . $record['source'] . '）');
    respond(500, ['error' => ERR_SAVE_FAILED]);
}

// 日志中只出现内部 ID 与来源，绝不出现手机号或微信号
error_log('[leads] 新线索 ' . $record['id'] . '（来源 ' . $record['source'] . '）');

respond(200, ['ok' => true, 'id' => $record['id']]);

/* -------------------------------------------------------------------------- */
/* 响应                                                                        */
/* -------------------------------------------------------------------------- */

function respond(int $status, array $body): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($body, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

/* -------------------------------------------------------------------------- */
/* 请求解析                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * 取客户端 IP。
 *
 * 前两步与原 Node 实现一致（X-Forwarded-For 首段 → X-Real-IP）。
 * 第三步是**刻意补充**：原实现在两者都取不到时返回空串，
 * 于是限流被完全跳过、ipHash 也不存 —— 在共享主机上若代理不转发这两个头，
 * 就会静默失去限流与 PIPL 要求的 IP 哈希，而且没有任何迹象。
 */
function client_ip(): string
{
    $xff = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '';
    if ($xff !== '') {
        $first = trim(explode(',', $xff)[0]);
        if ($first !== '') {
            return $first;
        }
    }

    $real = trim((string) ($_SERVER['HTTP_X_REAL_IP'] ?? ''));
    if ($real !== '') {
        return $real;
    }

    return trim((string) ($_SERVER['REMOTE_ADDR'] ?? ''));
}

/**
 * 校验提交内容，返回字段级错误列表（空数组 = 通过）。
 *
 * 与 lib/content/schemas/lead.ts 逐条对应。字段级 error 前端并不展示
 * （LeadForm 只读顶层 error），但保持与 schema 一致，便于对照排查。
 */
function validate(array $in): array
{
    $errors = [];

    // ---- consent（必填对象）----
    $consent = $in['consent'] ?? null;
    if (!is_array($consent)) {
        $errors[] = ['path' => 'consent', 'message' => '必须提交隐私政策同意'];
    } else {
        // 严格布尔 true：拒绝 1、"true"、"1" 等真值
        if (($consent['privacyAccepted'] ?? null) !== true) {
            $errors[] = ['path' => 'consent.privacyAccepted', 'message' => '必须同意隐私政策'];
        }
        $pv = $consent['policyVersion'] ?? null;
        if (!is_string($pv) || str_len($pv) < 1 || str_len($pv) > 40) {
            $errors[] = ['path' => 'consent.policyVersion', 'message' => '隐私政策版本号不合法'];
        }
    }

    // ---- 必填：source ----
    $source = $in['source'] ?? null;
    if (!is_string($source) || !in_array($source, LEAD_SOURCES, true)) {
        $errors[] = ['path' => 'source', 'message' => '来源标识不合法'];
    }

    // ---- 必填：landingPage ----
    $landing = $in['landingPage'] ?? null;
    if (!is_string($landing) || str_len($landing) < 1 || str_len($landing) > 500) {
        $errors[] = ['path' => 'landingPage', 'message' => '落地页参数不合法'];
    }

    // ---- 联系方式：至少一项 ----
    $phone = is_string($in['phone'] ?? null) ? trim($in['phone']) : '';
    $wechat = is_string($in['wechat'] ?? null) ? trim($in['wechat']) : '';

    if ($phone === '' && $wechat === '') {
        $errors[] = ['path' => 'phone', 'message' => '请至少填写手机号或微信号中的一项'];
    }

    if ($phone !== '') {
        if (str_len($phone) > 20) {
            $errors[] = ['path' => 'phone', 'message' => '手机号过长'];
        } elseif (!preg_match(CN_PHONE_REGEX, $phone)) {
            $errors[] = ['path' => 'phone', 'message' => '请输入有效的中国大陆手机号'];
        }
    }

    if ($wechat !== '') {
        if (str_len($wechat) > 40) {
            $errors[] = ['path' => 'wechat', 'message' => '微信号过长'];
        } elseif (str_len($wechat) < 6) {
            $errors[] = ['path' => 'wechat', 'message' => '微信号至少 6 个字符'];
        } elseif (!preg_match(WECHAT_REGEX, $wechat)) {
            $errors[] = ['path' => 'wechat', 'message' => '微信号格式不正确（以字母开头，可由字母、数字、下划线组成）'];
        }
    }

    // ---- 自测分数与分级：必须同时提供或同时省略 ----
    $score = $in['testScore'] ?? null;
    $severity = $in['testSeverity'] ?? null;
    $hasScore = $score !== null;
    $hasSeverity = $severity !== null;

    if ($hasScore !== $hasSeverity) {
        $errors[] = ['path' => 'testSeverity', 'message' => 'testScore 与 testSeverity 必须同时提供或同时省略'];
    } else {
        if ($hasScore) {
            $isIntegral = is_int($score) || (is_float($score) && floor($score) === $score);
            if (!$isIntegral || $score < 0 || $score > 28) {
                $errors[] = ['path' => 'testScore', 'message' => '自测分数不合法'];
            }
        }
        if ($hasSeverity && (!is_string($severity) || !in_array($severity, SEVERITY_BANDS, true))) {
            $errors[] = ['path' => 'testSeverity', 'message' => '自测分级不合法'];
        }
    }

    // ---- 可选字符串字段 ----
    $optionalStrings = [
        'nickname' => 40,
        'keyword' => 100,
        'sleepProblem' => 120,
        'aiConversationId' => 64,
    ];
    foreach ($optionalStrings as $field => $max) {
        $value = $in[$field] ?? null;
        if ($value === null) {
            continue;
        }
        if (!is_string($value) || str_len($value) > $max) {
            $errors[] = ['path' => $field, 'message' => $field . ' 不合法'];
            continue;
        }
        if ($field === 'sleepProblem' && !preg_match(SLUG_REGEX, $value)) {
            $errors[] = ['path' => $field, 'message' => 'sleepProblem 必须是 slug'];
        }
    }

    // ---- 可选：productInterest ----
    $interest = $in['productInterest'] ?? null;
    if ($interest !== null) {
        if (!is_array($interest) || count($interest) > 20) {
            $errors[] = ['path' => 'productInterest', 'message' => 'productInterest 不合法'];
        } else {
            foreach ($interest as $item) {
                if (!is_string($item) || str_len($item) > 60) {
                    $errors[] = ['path' => 'productInterest', 'message' => 'productInterest 不合法'];
                    break;
                }
            }
        }
    }

    // ---- 可选：meta ----
    $meta = $in['meta'] ?? null;
    if ($meta !== null) {
        if (!is_array($meta)) {
            $errors[] = ['path' => 'meta', 'message' => 'meta 不合法'];
        } else {
            $referrer = $meta['referrer'] ?? null;
            if ($referrer !== null && (!is_string($referrer) || str_len($referrer) > 2000)) {
                $errors[] = ['path' => 'meta.referrer', 'message' => 'meta.referrer 不合法'];
            }
            $utm = $meta['utm'] ?? null;
            if ($utm !== null) {
                if (!is_array($utm)) {
                    $errors[] = ['path' => 'meta.utm', 'message' => 'meta.utm 不合法'];
                } else {
                    foreach ($utm as $key => $value) {
                        if (!is_string($key) || str_len($key) > 40
                            || !is_string($value) || str_len($value) > 200) {
                            $errors[] = ['path' => 'meta.utm', 'message' => 'meta.utm 不合法'];
                            break;
                        }
                    }
                }
            }
        }
    }

    return $errors;
}

/* -------------------------------------------------------------------------- */
/* 记录构造                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * 构造落库记录，与 buildLeadRecord（lib/leads/store.ts）保持一致。
 *
 * 字段白名单是刻意的：Zod 的 z.object 默认剥离未知键，PHP 若直接保存原始输入，
 * 攻击者就能把任意 JSON 持久化进线索文件。
 *
 * @param array<string,mixed> $in
 * @return array<string,mixed>
 */
function build_record(array $in, string $now, ?string $ipHash): array
{
    $record = [];

    // 键顺序对齐 schema 定义顺序（Zod 输出保持定义顺序）
    foreach (['nickname', 'phone', 'wechat', 'source', 'landingPage', 'keyword'] as $field) {
        if (isset($in[$field]) && is_string($in[$field])) {
            $value = trim($in[$field]);
            if ($value !== '') {
                $record[$field] = $value;
            }
        }
    }

    if (isset($in['sleepProblem']) && is_string($in['sleepProblem'])) {
        $record['sleepProblem'] = $in['sleepProblem'];
    }
    if (isset($in['testScore']) && (is_int($in['testScore']) || is_float($in['testScore']))) {
        $record['testScore'] = (int) $in['testScore'];
    }
    if (isset($in['testSeverity']) && is_string($in['testSeverity'])) {
        $record['testSeverity'] = $in['testSeverity'];
    }
    if (isset($in['aiConversationId']) && is_string($in['aiConversationId'])) {
        $record['aiConversationId'] = $in['aiConversationId'];
    }
    if (isset($in['productInterest']) && is_array($in['productInterest'])) {
        $record['productInterest'] = array_values($in['productInterest']);
    }

    // consent：用 acceptedAt 重建，privacyAccepted 固定为 true（校验已保证）
    $record['consent'] = [
        'privacyAccepted' => true,
        'acceptedAt' => $now,
        'policyVersion' => (string) ($in['consent']['policyVersion'] ?? ''),
    ];

    $record['meta'] = is_array($in['meta'] ?? null) ? $in['meta'] : [];

    // 以下三项在 JS 里是展开之后追加的，所以排在上面这些字段之后
    $record['id'] = ulid();
    $record['consultationStatus'] = 'new';
    $record['createdAt'] = $now;
    $record['updatedAt'] = $now;

    if ($ipHash !== null) {
        $record['ipHash'] = $ipHash;
    }

    $userAgent = (string) ($_SERVER['HTTP_USER_AGENT'] ?? '');
    if ($userAgent !== '') {
        $record['meta']['userAgent'] = str_cut($userAgent, 500);
    }

    // 空数组会被 json_encode 成 []（数组），而 JS 里 meta 恒为对象，统一成 {}。
    if ($record['meta'] === []) {
        $record['meta'] = new stdClass();
    }

    return $record;
}

/**
 * IP 加盐哈希 —— 必须与 store.ts 的 hashIp 输出完全一致：
 * sha256(salt + ":" + ip)，小写十六进制。
 *
 * 盐为空时不存哈希，而不是存一个可被反查的弱哈希（与 store.ts 同）。
 */
function hash_ip(string $ip, string $salt): ?string
{
    if ($ip === '' || $salt === '') {
        return null;
    }

    return hash('sha256', $salt . ':' . $ip);
}

/**
 * ULID：26 字符 Crockford base32，前 48 位是毫秒时间戳，因此按字典序即按时间序。
 * PHP 没有内置实现，这里内联一个（与原 `ulid` npm 包的输出格式兼容）。
 *
 * 同一毫秒内的单调性不做保证 —— 这里不需要，记录排序由 createdAt 决定。
 */
function ulid(): string
{
    $alphabet = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
    $time = (int) round(microtime(true) * 1000);

    $bytes = '';
    for ($i = 5; $i >= 0; $i--) {
        $bytes .= chr(($time >> ($i * 8)) & 0xFF);
    }
    $bytes .= random_bytes(10); // 80 位随机

    $bits = '';
    for ($i = 0, $len = strlen($bytes); $i < $len; $i++) {
        $bits .= str_pad(decbin(ord($bytes[$i])), 8, '0', STR_PAD_LEFT);
    }
    $bits = str_pad($bits, 130, '0', STR_PAD_LEFT); // 128 位补齐到 26×5

    $out = '';
    for ($i = 0; $i < 26; $i++) {
        $out .= $alphabet[bindec(substr($bits, $i * 5, 5))];
    }

    return $out;
}

/**
 * 复刻 JS `new Date().toISOString()` 的形态：UTC + 毫秒 + Z，例如 2026-10-01T12:00:00.000Z。
 */
function iso_now(): string
{
    $t = microtime(true);
    $seconds = (int) $t;
    $millis = (int) round(($t - $seconds) * 1000);
    if ($millis > 999) {
        $millis = 999; // round 可能到 1000
    }

    return gmdate('Y-m-d\TH:i:s', $seconds) . '.' . sprintf('%03d', $millis) . 'Z';
}

/* -------------------------------------------------------------------------- */
/* 存储                                                                        */
/* -------------------------------------------------------------------------- */

/**
 * 追加一条 JSONL 记录。
 *
 * FILE_APPEND | LOCK_EX 是跨进程原子追加 —— 这比原 Node 实现更健壮：
 * 原版只能靠「PM2 必须 fork 模式、单实例」的文档约定来避免并发写坏文件。
 *
 * ⚠️ JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE 是必需的：
 * PHP 的 json_encode 默认把 / 转义成 \/、把中文转成 \uXXXX，而 JS 的 JSON.stringify 两者都不转。
 * 不加这两个 flag，写出来的记录与 Node 时期的格式不一致（仍是合法 JSON，但对照排查会很困惑）。
 */
function append_jsonl(string $file, array $record): bool
{
    $dir = dirname($file);
    if (!is_dir($dir) && !@mkdir($dir, 0700, true) && !is_dir($dir)) {
        error_log('[leads] 无法创建数据目录');
        return false;
    }

    $line = json_encode($record, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    if ($line === false) {
        error_log('[leads] JSON 编码失败');
        return false;
    }

    return @file_put_contents($file, $line . "\n", FILE_APPEND | LOCK_EX) !== false;
}

/**
 * 固定窗口限流：5 次 / 10 分钟。
 *
 * PHP 在请求之间不共享任何内存，所以原实现里那个模块级 Map 没有等价物，
 * 只能用文件 + flock 做跨请求状态。
 *
 * 打开文件失败时**放行**：与原实现一致，不因基础设施故障阻断真实线索。
 */
function rate_limited(string $key, string $file): bool
{
    $handle = @fopen($file, 'c+');
    if ($handle === false) {
        error_log('[leads] 限流文件不可用，本次放行');
        return false;
    }

    if (!flock($handle, LOCK_EX)) {
        fclose($handle);
        return false;
    }

    $raw = stream_get_contents($handle);
    $map = json_decode($raw === false ? '' : $raw, true);
    if (!is_array($map)) {
        $map = [];
    }

    $now = time();
    foreach ($map as $bucketKey => $bucket) {
        if (!is_array($bucket) || ($bucket['resetAt'] ?? 0) < $now) {
            unset($map[$bucketKey]); // 清过期桶，防止文件无限增长
        }
    }

    $limited = false;
    if (!isset($map[$key])) {
        $map[$key] = ['count' => 1, 'resetAt' => $now + RATE_WINDOW_SECONDS];
    } elseif (($map[$key]['count'] ?? 0) >= RATE_LIMIT) {
        $limited = true;
    } else {
        $map[$key]['count'] = ($map[$key]['count'] ?? 0) + 1;
    }

    if (count($map) > RATE_FILE_MAX_ENTRIES) {
        $map = array_slice($map, -intdiv(RATE_FILE_MAX_ENTRIES, 2), null, true);
    }

    ftruncate($handle, 0);
    rewind($handle);
    fwrite($handle, (string) json_encode($map));
    fflush($handle);
    flock($handle, LOCK_UN);
    fclose($handle);

    return $limited;
}
