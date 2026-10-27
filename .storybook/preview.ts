import type { Preview } from '@storybook/web-components-vite'
import { setupWorker } from 'msw/browser'
import { mswLoader } from 'msw-storybook-addon/csf3'

import '@/styles/main.css'
import { Locale } from '@/shared/i18n/i18n.const'
import { blockAlmaApi } from '@/test/block-alma-api'

import { withMerchantCss } from './decorators/merchant-css'
import { withModalContainer } from './decorators/modal-container'

// Stories mock requests with parameters.msw.handlers. Storybook's and Vite's requests go through.
const startMsw = async () => {
  // Survives the reset between stories. A story's handlers come first.
  const worker = setupWorker(
    ...blockAlmaApi((request) => {
      console.error(`No MSW handler for ${request.method} ${request.url} in this story`)
    }),
  )
  await worker.start({ quiet: true, onUnhandledRequest: 'bypass' })
  return worker
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
  decorators: [withModalContainer, withMerchantCss],
  globalTypes: {
    merchantCss: {
      description: 'Load merchant CSS after main.css',
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
          {
            value: 'fixtures',
            title: 'Merchant page CSS + the merchant CSS of the contract tests',
          },
        ],
        dynamicTitle: true,
      },
    },
    locale: {
      description: 'Locale of the stories that format text',
      toolbar: { title: 'Locale', icon: 'globe', items: Object.values(Locale), dynamicTitle: true },
    },
  },
  initialGlobals: { merchantCss: 'off', locale: Locale.en },
  parameters: {
    // One on each side of the modal's 800 px breakpoint.
    viewport: {
      options: {
        mobile: { name: 'Mobile', styles: { width: '375px', height: '812px' } },
        desktop: { name: 'Desktop', styles: { width: '1280px', height: '800px' } },
      },
    },
    a11y: {
      // Each axe tag covers only the rules added at its level, so all five run.
      options: {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
      },
      // The panel informs. The blocking accessibility checks run in Vitest.
      test: 'todo',
    },
  },
  beforeEach: () => {
    // The widget caches the eligibility response for an hour
    sessionStorage.clear()
    return keepBodyClean()
  },
}

export default preview
