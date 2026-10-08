import type { Decorator, Preview } from '@storybook/web-components-vite'

import merchantCss from '../examples/style.css?inline'
import { mockEligibilityApi } from './mockEligibilityApi'

const MERCHANT_CSS_ID = 'merchant-css'

/**
 * Adds examples/style.css to the page when the "Merchant CSS" toolbar toggle is on. That
 * stylesheet mimics a merchant theme that fights the widget styles (root font size, button styles…).
 */
const withMerchantCss: Decorator = (story, { globals }) => {
  document.getElementById(MERCHANT_CSS_ID)?.remove()
  if (globals.merchantCss === 'on') {
    const style = document.createElement('style')
    style.id = MERCHANT_CSS_ID
    style.textContent = merchantCss
    document.head.append(style)
  }
  return story()
}

const preview: Preview = {
  decorators: [withMerchantCss],
  globalTypes: {
    merchantCss: {
      description: 'Load the merchant stylesheet of examples/style.css',
      toolbar: {
        title: 'Merchant CSS',
        icon: 'paintbrush',
        items: [
          { value: 'off', title: 'Without merchant CSS' },
          { value: 'on', title: 'With merchant CSS' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { merchantCss: 'off' },
  parameters: {
    // The eligibility modal switches between its mobile and desktop layouts at 800px
    viewport: {
      options: {
        mobile: { name: 'Mobile', styles: { width: '375px', height: '812px' } },
        desktop: { name: 'Desktop', styles: { width: '1280px', height: '800px' } },
      },
    },
    // Chromatic snapshots every story once per mode. Chromatic pairs a snapshot with its baseline
    // by story and mode name, so renaming a mode drops the baselines accepted for it.
    chromatic: {
      modes: {
        mobile: { viewport: 'mobile', merchantCss: 'off' },
        desktop: { viewport: 'desktop', merchantCss: 'off' },
        'mobile merchant-css': { viewport: 'mobile', merchantCss: 'on' },
        'desktop merchant-css': { viewport: 'desktop', merchantCss: 'on' },
      },
    },
  },
  beforeEach: ({ parameters }) => {
    // The widget caches the eligibility response for an hour: start every story without it
    sessionStorage.clear()
    return mockEligibilityApi(parameters.eligibility ?? 'pending')
  },
}

export default preview
