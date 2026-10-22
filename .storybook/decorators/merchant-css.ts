import type { Decorator } from '@storybook/web-components-vite'

import examplesCss from '../../examples/style.css?inline'

// Every merchant CSS fixture of the contract tests, so a new fixture loads with no config change.
const fixtures = import.meta.glob<string>(
  '../../tests/integration/contract/fixtures/merchant-css/*.css',
  { query: '?inline', import: 'default', eager: true },
)

const MERCHANT_CSS = [examplesCss, ...Object.values(fixtures)].join('\n')
const STYLE_ID = 'storybook-merchant-css'

// With the "Merchant CSS" toolbar on, merchant rules load after main.css, as on a merchant page.
export const withMerchantCss: Decorator = (story, { globals }) => {
  document.getElementById(STYLE_ID)?.remove()
  if (globals.merchantCss === 'on') {
    const style = document.createElement('style')
    style.id = STYLE_ID
    style.textContent = MERCHANT_CSS
    document.head.append(style)
  }
  return story()
}
