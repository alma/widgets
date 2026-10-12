import type { Decorator, Preview } from '@storybook/web-components-vite'
import { http, HttpResponse } from 'msw'
import { setupWorker } from 'msw/browser'
import { mswLoader } from 'msw-storybook-addon/csf3'

import { ApiMode } from '@/consts'

import merchantPageCss from '../examples/style.css?inline'
import merchantCustomizationCss from './merchant-customization.css?inline'

const MERCHANT_CSS_ID = 'merchant-css'

// Blocks the Alma API requests a story doesn't mock, so no story reaches the real API
const blockAlmaApi = Object.values(ApiMode).map((origin) =>
  http.all(`${origin}/*`, ({ request }) => {
    console.error(`No MSW handler for ${request.method} ${request.url} in this story`)
    return HttpResponse.error()
  }),
)

const startMsw = async () => {
  // Handlers passed to setupWorker() are kept between stories
  const worker = setupWorker(...blockAlmaApi)
  await worker.start({ quiet: true, onUnhandledRequest: 'bypass' })
  return worker
}

// `on`: a merchant page theme. `customized`: the same, plus a widget customization
const withMerchantCss: Decorator = (story, { globals }) => {
  document.getElementById(MERCHANT_CSS_ID)?.remove()
  if (globals.merchantCss === 'on' || globals.merchantCss === 'customized') {
    const style = document.createElement('style')
    style.id = MERCHANT_CSS_ID
    style.textContent =
      globals.merchantCss === 'customized'
        ? `${merchantPageCss}\n${merchantCustomizationCss}`
        : merchantPageCss
    document.head.append(style)
  }
  return story()
}

// Undoes what the modal adds to <body>, so it doesn't show in the next story
const keepBodyClean = () => {
  const initialChildren = new Set(document.body.children)
  const initialAttributes = [document.documentElement, document.body].map((element) => ({
    element,
    className: element.className,
    style: element.getAttribute('style'),
  }))
  return () => {
    Array.from(document.body.children)
      .filter((child) => !initialChildren.has(child))
      .forEach((child) => child.remove())
    initialAttributes.forEach(({ element, className, style }) => {
      element.className = className
      if (style === null) element.removeAttribute('style')
      else element.setAttribute('style', style)
    })
  }
}

const preview: Preview = {
  loaders: [mswLoader(startMsw)],
  decorators: [withMerchantCss],
  globalTypes: {
    merchantCss: {
      description: 'Load merchant CSS around the widget',
      toolbar: {
        title: 'Merchant CSS',
        icon: 'paintbrush',
        items: [
          { value: 'off', title: 'Without merchant CSS' },
          { value: 'on', title: 'Merchant page CSS (should not affect the widget)' },
          {
            value: 'customized',
            title: 'Merchant page CSS + widget customization (should restyle it)',
          },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { merchantCss: 'off' },
  parameters: {
    // The modal switches layouts at 800px
    viewport: {
      options: {
        mobile: { name: 'Mobile', styles: { width: '375px', height: '812px' } },
        desktop: { name: 'Desktop', styles: { width: '1280px', height: '800px' } },
      },
    },
    // Some stories add the modes of src/test/storybookModes.ts
    chromatic: {
      modes: {
        desktop: { viewport: 'desktop', merchantCss: 'off' },
      },
    },
  },
  beforeEach: () => {
    // The widget caches the eligibility response for an hour
    sessionStorage.clear()
    return keepBodyClean()
  },
}

export default preview
