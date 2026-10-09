import type { Decorator, Preview } from '@storybook/web-components-vite'
import { http, HttpResponse } from 'msw'
import { setupWorker } from 'msw/browser'
import { mswLoader } from 'msw-storybook-addon/csf3'

import { ApiMode } from '@/consts'

import merchantCss from '../examples/style.css?inline'

const MERCHANT_CSS_ID = 'merchant-css'

/**
 * Fails every Alma API request that the story doesn't mock, so no story can reach the real API.
 * The handlers a story sets in `parameters.msw` take precedence over these.
 */
const blockAlmaApi = Object.values(ApiMode).map((origin) =>
  http.all(`${origin}/*`, ({ request }) => {
    console.error(`No MSW handler for ${request.method} ${request.url} in this story`)
    return HttpResponse.error()
  }),
)

/**
 * Starts MSW, which answers the API requests that stories mock with `parameters.msw` (see
 * src/test/eligibilityHandlers.ts). Requests that aren't for the Alma API (Storybook, Vite, fonts)
 * go through untouched.
 */
const startMsw = async () => {
  // Handlers passed to setupWorker() survive the reset that runs between stories
  const worker = setupWorker(...blockAlmaApi)
  await worker.start({ quiet: true, onUnhandledRequest: 'bypass' })
  return worker
}

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
  loaders: [mswLoader(startMsw)],
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
  beforeEach: () => {
    // The widget caches the eligibility response for an hour: start every story without it
    sessionStorage.clear()
  },
}

export default preview
