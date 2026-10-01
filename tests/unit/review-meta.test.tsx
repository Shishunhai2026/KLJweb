import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ReviewMeta } from '@/components/geo/ReviewMeta'

/**
 * 署名声明的回归防线。
 *
 * 这里守的是一条合规红线：**不能署名一次没发生过的医学审核。**
 * 从前的写法是 `reviewerName = getReviewerDisplayName()`——组件自带默认值，
 * 于是没登记审核人的纯科普文章也会在页脚出现「资料审核：田宗高老师」。
 * 那是把「田老师审过」写在了公开页面上，而田老师并没有审过。
 */

const BASE = {
  authorName: '和颐林睡眠研究团队',
  updatedAt: '2026-10-01',
}

const render = (props: Parameters<typeof ReviewMeta>[0]) =>
  renderToStaticMarkup(<ReviewMeta {...props} />)

describe('ReviewMeta —— 审核署名', () => {
  it('传入审核人时显示「资料审核」', () => {
    const html = render({ ...BASE, reviewerName: '田宗高老师' })

    expect(html).toContain('资料审核')
    expect(html).toContain('田宗高老师')
  })

  it('未传入审核人时整行不出现', () => {
    const html = render(BASE)

    expect(html).not.toContain('资料审核')
    expect(html).not.toContain('田宗高')
  })
})

describe('ReviewMeta —— 审核日期', () => {
  it('传了审核日期才显示', () => {
    const html = render({ ...BASE, reviewerName: '田宗高老师', lastReviewedAt: '2026-10-01' })

    expect(html).toContain('审核日期')
    expect(html).toContain('2026 年 10 月 1 日')
  })

  it('没传审核日期就不显示', () => {
    const html = render({ ...BASE, reviewerName: '田宗高老师' })

    expect(html).not.toContain('审核日期')
  })
})

describe('ReviewMeta —— 始终展示的字段', () => {
  it('作者与最后更新与审核情况无关，永远显示', () => {
    const html = render(BASE)

    expect(html).toContain('内容作者')
    expect(html).toContain('和颐林睡眠研究团队')
    expect(html).toContain('最后更新')
    expect(html).toContain('2026 年 10 月 1 日')
    expect(html).toContain('内容类型：睡眠健康科普')
  })
})
