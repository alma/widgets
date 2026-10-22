import { resolve } from 'node:path'

import { playwright } from '@vitest/browser-playwright'
import { configDefaults, defineConfig } from 'vitest/config'

// jsdom has no layout and no real Tab navigation, so only the modal's focus tests need a browser.
const BROWSER_TESTS = ['src/**/*.browser.test.ts']

export default defineConfig({
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
  test: {
    globals: true,
    setupFiles: ['src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.stories.ts',
        'src/**/*.d.ts',
        'src/**/*.types.ts',
        'src/test/**',
        // Their tests aren't ported yet. Each port removes its file from this list.
        'src/domain/plans/index.ts',
        'src/domain/plans/plans.const.ts',
        'src/public-api/public-api.const.ts',
        'src/shared/config/api-url.const.ts',
        'src/shared/lib/http.ts',
        'src/widgets/eligibility-modal/eligibility-modal.const.ts',
        'src/widgets/payment-plans/payment-plans.const.ts',
      ],
      thresholds: {
        branches: 88,
        functions: 95,
        lines: 95,
        statements: 95,
      },
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'jsdom',
          include: ['src/**/*.test.ts'],
          exclude: [...configDefaults.exclude, ...BROWSER_TESTS],
          setupFiles: ['src/test/setup-jsdom.ts'],
          // Like identity-obj-proxy on master: styles.planButton is 'planButton'.
          css: { modules: { classNameStrategy: 'non-scoped' } },
        },
      },
      {
        extends: true,
        test: {
          name: 'browser',
          include: BROWSER_TESTS,
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [{ browser: 'chromium' }],
          },
        },
      },
      {
        // Black-box tests on a built bundle: dist-ref/ (master) or dist/ (Lit), chosen by WIDGETS_DIST.
        extends: true,
        test: {
          name: 'contract',
          environment: 'jsdom',
          include: ['tests/integration/contract/**/*.test.ts'],
          setupFiles: ['tests/integration/contract/support/setup.ts'],
        },
      },
    ],
  },
})
