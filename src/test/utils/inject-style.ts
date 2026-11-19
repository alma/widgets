// The unit project loads no CSS. setup.ts doesn't empty <head>, so the style goes when the test ends.
// Call it in a test or a beforeEach: onTestFinished() throws anywhere else.
export const injectStyle = (css: string): HTMLStyleElement => {
  const style = document.createElement('style')
  style.textContent = css
  document.head.append(style)
  onTestFinished(() => style.remove())
  return style
}
