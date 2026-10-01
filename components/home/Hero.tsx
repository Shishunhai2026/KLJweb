import { HeroCarousel } from '@/components/home/HeroCarousel'

/**
 * 首页第一屏：客户提供的五张营销 banner，每 2 秒轮播一张。
 * （第 5 张「睡眠专利」为 2026-10-01 追加，同样是 2.88:1 的产物，容器比例无需调整。）
 *
 * 这一屏**只有画面，不叠加站内文案**——banner 图内自带标题与卖点，
 * 再压一层站内文字会变成两套文字打架。站内自己的主标题与 CTA
 * 已下移为紧邻的下一屏（HeroIntro）。
 *
 * ⚠️ 容器比例必须锁死等于 banner 产物的 2.88:1，不能改成视口高度驱动。
 * 之前的写法是 `lg:min-h-[calc(100svh-4rem)]`，容器高度随窗口高度变化：
 * 窗口越高，容器越「窄高」，object-cover 就横向裁得越狠
 * （1440×900 的窗口已裁掉左右各约 5%），贴着左右边缘的标题
 * （如「超氧化物歧化酶 SOD」）会被切掉。
 *
 * 图片本身的 2.88:1 来自 scripts/prepare-assets.py：
 * 原图是 1.92:1，内容几乎占满整幅高度、无法裁切，因此把整幅图直接拉伸到画布尺寸
 * ——横向铺满屏幕、纵向压到原来的三分之二，内容零损失，代价是画面横向变形。
 * 这是需求方在知情下选定的取舍，不要再「优化」成裁切或留边。
 */
export function Hero() {
  return (
    <section className="relative isolate w-full overflow-hidden bg-ink-950">
      <div className="relative aspect-[288/100] w-full">
        <HeroCarousel />
      </div>
    </section>
  )
}
