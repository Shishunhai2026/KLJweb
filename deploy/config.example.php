<?php

/**
 * 服务器端配置样例。
 *
 * 用法：复制为 klj-private/config.php，填好之后上传到**网站根目录之外**
 * （即 FTP 根的上一级，与 htdocs 平级）。详见 deploy/README.md。
 *
 * 这个文件刻意不进版本库、不上传成公开可读：里面的盐值一旦泄露，
 * 加盐哈希就失去意义（原始 IP 理论上可被暴力反查）。
 */

return [
    /*
     * IP 哈希的盐值。**必须替换为随机长字符串。**
     *
     * 本地生成一个：
     *   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     *
     * 绝不能留空：留空时接口会拒绝存 ipHash（而不是存一个可反查的弱哈希），
     * 那样线索仍然能落盘，只是失去了 IP 维度的风控能力。
     */
    'ip_hash_salt' => 'REPLACE-WITH-A-LONG-RANDOM-STRING',

    /*
     * 线索数据文件。**必须在网站根目录之外**——文件里是访客的手机号与微信号，
     * 属于《个人信息保护法》保护的个人信息，放在网站根目录内等于公开可下载。
     *
     * __DIR__ 就是 config.php 所在目录（klj-private/）。目录不存在时接口会自动创建。
     */
    'leads_file' => __DIR__ . '/leads.jsonl',

    /*
     * 限流状态文件。同样是运行期数据，放在一起即可。
     * 接口按 IP 限流（10 分钟 5 次）；删掉这个文件即重置限流。
     */
    'ratelimit_file' => __DIR__ . '/ratelimit.json',
];
