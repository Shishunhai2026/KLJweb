"""
从客户提供的原始素材生成站点用的图片资源。

原始素材（产品图片/、网站首页轮播图片/）不随仓库分发，
因此本脚本是一次性的构建辅助工具，产物 public/images/ 会入库。

用法：
    python scripts/prepare-assets.py

⚠️ 合规提示
    产品宣传图（康龄纪宣传图片*.jpg）是营销物料，图内**自带文字与功效表述**。
    把它们原样放到网站上，与本站「标注证据等级、不把企业宣传当医学结论」的
    原则直接冲突。因此：
      - 这些图片仅作为「企业提供的产品资料」原样存档，
        使用时必须在页面上标明出处与核验状态，不得作为独立证据。
      - 上线前应由客户与法务逐张复核图内文字是否可公开发布。
    本脚本只负责转码与压缩，不做内容判断。
"""

from __future__ import annotations

import os
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
SRC_PRODUCT = ROOT / "产品图片"
SRC_CAROUSEL = ROOT / "网站首页轮播图片"
OUT = ROOT / "public"

# 品牌色（与 app/globals.css 的 @theme 保持一致）
INK_950 = (14, 36, 57)
INK_900 = (28, 58, 89)
INK_700 = (41, 83, 129)
GOLD_300 = (229, 196, 120)
GOLD_400 = (217, 169, 75)
WHITE = (255, 255, 255)

FONT_BOLD = "C:/Windows/Fonts/msyhbd.ttc"
FONT_REGULAR = "C:/Windows/Fonts/msyh.ttc"

# 轮播图 → 语义化文件名。
# 字典顺序 = 首屏轮播顺序，改动这里就要同步 components/home/HeroCarousel.tsx 的 SLIDES。
CAROUSEL_MAP = {
    "轮播图片1.png": "sod-molecule.webp",
    "轮播图片2.jpg": "light-lifestyle.webp",
    "轮播图片3.jpg": "plant-nutrition.webp",
    "轮播图片4.jpg": "good-sleep.webp",
    # 2026-10-01 追加。原图 870×435（2.0:1），与其余四张同为客户提供的营销物料，
    # 走同一条「拉伸到画布」的处理，保持首屏五张画面风格一致。
    "睡眠专利.png": "sleep-patents.webp",
}

# 轮播 banner 的目标宽高比。原图是 1600×834（≈1.92:1），
# 需求方要求上下再缩短三分之一，即高度 ×2/3 → 1.92 ÷ 2/3 ≈ 2.88:1。
CAROUSEL_ASPECT = 2.88


def ensure_dirs() -> None:
    for sub in ("images/hero", "images/product", "brand", "og"):
        (OUT / sub).mkdir(parents=True, exist_ok=True)


def linear_gradient(size: tuple[int, int], start: tuple[int, int, int],
                    end: tuple[int, int, int], angle_bias: float = 0.0) -> Image.Image:
    """
    线性渐变。

    angle_bias=0 为纯垂直；越接近 1 越接近水平。
    用 numpy 一次算完整幅图，而不是逐行画线——
    逐行画线在横向偏移时会产生可见的斜向断层。
    """
    try:
        import numpy as np
    except ImportError:
        base = Image.new("RGB", size, start)
        draw = ImageDraw.Draw(base)
        _, height = size
        for y in range(height):
            t = (y / max(height - 1, 1)) ** 0.85
            draw.line([(0, y), (size[0], y)],
                      fill=tuple(int(start[i] + (end[i] - start[i]) * t) for i in range(3)))
        return base

    width, height = size
    y = np.linspace(0.0, 1.0, height, dtype=np.float32)[:, None]
    x = np.linspace(0.0, 1.0, width, dtype=np.float32)[None, :]

    t = np.clip(y * (1.0 - angle_bias) + x * angle_bias, 0.0, 1.0)
    # 轻微加速曲线，让深色区域更有分量
    t = t ** 0.85

    a = np.array(start, dtype=np.float32)
    b = np.array(end, dtype=np.float32)
    grad = a[None, None, :] + (b - a)[None, None, :] * t[:, :, None]
    return Image.fromarray(grad.astype("uint8"))


def add_glow(img: Image.Image, center: tuple[int, int], radius: int,
             color: tuple[int, int, int], strength: int = 70) -> Image.Image:
    """在指定位置叠加一团柔和的径向光晕。"""
    glow = Image.new("RGB", img.size, (0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    cx, cy = center
    steps = 22
    for i in range(steps, 0, -1):
        r = int(radius * i / steps)
        alpha = int(strength * (1 - i / steps) ** 1.6)
        glow_draw.ellipse(
            [cx - r, cy - r, cx + r, cy + r],
            fill=tuple(int(c * alpha / 255) for c in color),
        )
    glow = glow.filter(ImageFilter.GaussianBlur(radius // 5))
    return Image.fromarray(_screen(img, glow))


def _screen(base: Image.Image, top: Image.Image):
    """screen 混合模式，让光晕自然地叠加在深色背景上。"""
    import numpy as np

    b = np.asarray(base, dtype=np.float32) / 255.0
    t = np.asarray(top, dtype=np.float32) / 255.0
    out = 1 - (1 - b) * (1 - t)
    return (out * 255).astype("uint8")


def make_og_image() -> None:
    """生成 1200x630 的默认社交分享图。"""
    w, h = 1200, 630
    img = linear_gradient((w, h), INK_950, INK_700, angle_bias=0.25)

    try:
        img = add_glow(img, (980, 130), 420, GOLD_400, strength=52)
        img = add_glow(img, (150, 540), 380, (70, 140, 205), strength=64)
    except ImportError:
        # 没有 numpy 时跳过光晕，不影响主流程
        pass

    draw = ImageDraw.Draw(img, "RGBA")

    title_font = ImageFont.truetype(FONT_BOLD, 68)
    sub_font = ImageFont.truetype(FONT_REGULAR, 30)
    small_font = ImageFont.truetype(FONT_REGULAR, 25)

    draw.text((80, 168), "和颐林·睡眠大师", font=title_font, fill=WHITE)
    draw.text(
        (80, 268),
        "睡眠健康知识与睡眠问题解决方案平台",
        font=sub_font,
        fill=(198, 221, 240),
    )

    # 分隔线
    draw.line([(80, 330), (300, 330)], fill=GOLD_400, width=3)

    draw.text(
        (80, 366),
        "睡眠知识 · 睡眠自测 · AI睡眠助手",
        font=small_font,
        fill=(156, 195, 227),
    )

    # 右下角免责标识：让分享图本身也传递「不是医疗建议」的定位
    disclaimer = "健康科普内容 · 不能替代医生诊断"
    dw = draw.textlength(disclaimer, font=small_font)
    draw.text((w - 80 - dw, h - 92), disclaimer, font=small_font, fill=(120, 152, 180))

    img.save(OUT / "og" / "default.jpg", "JPEG", quality=88, optimize=True)
    print("  ✓ og/default.jpg")


def make_logo() -> None:
    """生成方形品牌标识，供 JSON-LD 的 Organization.logo 使用。"""
    size = 512
    img = linear_gradient((size, size), INK_950, INK_700, angle_bias=0.3)
    draw = ImageDraw.Draw(img, "RGBA")

    # 月牙：用两个圆做差集，比绘制贝塞尔曲线简单且边缘干净
    try:
        mask = Image.new("L", (size, size), 0)
        md = ImageDraw.Draw(mask)
        md.ellipse([136, 136, 376, 376], fill=255)
        md.ellipse([212, 116, 452, 356], fill=0)
        img.paste(GOLD_300, (0, 0), mask)
    except Exception:
        pass

    img.save(OUT / "brand" / "logo.png", "PNG", optimize=True)
    print("  ✓ brand/logo.png")


def convert_carousel() -> None:
    """
    轮播 banner：转码并压到 CAROUSEL_ASPECT。

    这几张图的内容几乎占满整幅高度——标题距上沿只有 1%~13%，
    底部是产品实物与包装，纵向可裁的空白最多不到 12%（有一张几乎为 0）。
    所以不能靠裁切来缩短高度，一裁就会切断标题。

    按需求方确认的方案：整幅图**直接拉伸**到画布尺寸。
    横向铺满屏幕、纵向压到原来的三分之二，内容一个像素都不丢；
    代价是画面被横向拉宽（1600×834 → 1600×556，约 1.5 倍），
    图内文字与产品会明显变胖——这是需求方在知情下选定的取舍。

    后追加的 `睡眠专利.png` 原图是 2.0:1，同样拉伸到 2.88:1（约 1.44 倍）。
    拉伸倍数与其余四张接近，五张轮播的形变程度一致；不要单独为它改成裁切，
    否则首屏会出现一张「正常」夹在四张「变胖」中间。
    """
    for src_name, out_name in CAROUSEL_MAP.items():
        src = SRC_CAROUSEL / src_name
        if not src.exists():
            print(f"  ! 缺少素材：{src_name}")
            continue

        img = Image.open(src).convert("RGB")
        # 放大到 1600 宽供大屏使用；原图更宽的保持原尺寸
        if img.width < 1600:
            ratio = 1600 / img.width
            img = img.resize((1600, int(img.height * ratio)), Image.LANCZOS)

        canvas_w = img.width
        canvas_h = round(canvas_w / CAROUSEL_ASPECT)

        # 直接拉伸到画布：横向铺满、纵向压扁，不裁切任何一个像素
        canvas = img.resize((canvas_w, canvas_h), Image.LANCZOS)
        canvas.save(OUT / "images" / "hero" / out_name, "WEBP", quality=86, method=6)
        print(f"  ✓ images/hero/{out_name}  ({canvas_w}x{canvas_h}，横向铺满)")


def convert_product() -> None:
    if not SRC_PRODUCT.exists():
        print("  ! 缺少 产品图片/ 目录")
        return
    for src in sorted(SRC_PRODUCT.iterdir()):
        if src.suffix.lower() not in {".jpg", ".jpeg", ".png"}:
            continue
        name = src.stem.replace("康龄纪", "heyilin")
        # 用序号命名，避免中文文件名进入 URL
        if "宣传图片" in src.stem:
            idx = src.stem.split("宣传图片")[-1]
            out_name = f"promo-{int(idx):02d}.webp"
        elif "产品信息" in src.stem:
            out_name = "product-info.webp"
        else:
            out_name = f"{name}.webp"

        img = Image.open(src).convert("RGB")
        # 长图限制高度，避免单张图片过大
        img.save(OUT / "images" / "product" / out_name, "WEBP", quality=82, method=6)
        print(f"  ✓ images/product/{out_name}  ({img.width}x{img.height})")


def main() -> None:
    ensure_dirs()
    print("生成品牌资源：")
    make_logo()
    make_og_image()
    print("转码轮播图：")
    convert_carousel()
    print("转码产品图：")
    convert_product()
    print("\n完成。产物位于 public/")


if __name__ == "__main__":
    main()
