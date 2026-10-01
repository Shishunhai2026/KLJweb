/** 键盘用户的「跳到主内容」链接，聚焦前视觉隐藏。 */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-ink-950 focus:px-4 focus:py-2.5 focus:text-sm focus:font-medium focus:text-white"
    >
      跳到主要内容
    </a>
  )
}
