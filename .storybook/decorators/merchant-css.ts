import type { Decorator } from '@storybook/web-components-vite'

import examplesCss from '../../examples/style.css?inline'
import merchantCustomizationCss from '../merchant-customization.css?inline'

// on, customized and off match master's Storybook, so Chromatic can compare the two builds.
const MERCHANT_CSS: Record<string, string> = {
  on: examplesCss,
  customized: `${examplesCss}\n${merchantCustomizationCss}`,
}
const STYLE_ID = 'merchant-css'

// The merchant rules load after main.css, as on a merchant page.
export const withMerchantCss: Decorator = (story, { globals }) => {
  document.getElementById(STYLE_ID)?.remove()
  const css = MERCHANT_CSS[globals.merchantCss]
  if (css) {
    const style = document.createElement('style')
    style.id = STYLE_ID
    style.textContent = css
    document.head.append(style)
  }
  return story()
}
