import type { Preview } from '@storybook/web-components-vite'

import '@/styles/main.css'
import { Locale } from '@/shared/i18n/i18n.const'

import { withMerchantCss } from './decorators/merchant-css'
import { withModalContainer } from './decorators/modal-container'

const preview: Preview = {
  decorators: [withModalContainer, withMerchantCss],
  globalTypes: {
    merchantCss: {
      description: 'Load merchant CSS after main.css',
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
}

export default preview
