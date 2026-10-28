import { playwright } from '@vitest/browser-playwright'
import { configDefaults, defineConfig } from 'vitest/config'
import { icuCatalogues } from './scripts/vite-plugin-icu'
import { alias, define } from './vite.config'

// jsdom has no layout and no real Tab navigation, so only the modal's focus tests need a browser.
const BROWSER_TESTS = ['src/**/*.browser.test.ts']

export default defineConfig({
  // Same alias, env values and compiled catalogues as the build.
  resolve: { alias },
  define,
  plugins: [icuCatalogues()],
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.stories.ts',
        'src/**/*.d.ts',
        'src/**/*.types.ts',
        'src/test/**',
        // Only npm run test:harness reads the lint fixtures.
        'src/__lint-fixtures__/**',
        // Their tests aren't ported yet. Each port removes its file from this list.
        'src/index.ts',
        'src/public-api/public-api.const.ts',
        'src/public-api/widgets.ts',
        'src/shared/config/api-url.const.ts',
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
        // intl-messageformat's CommonJS entry would require() the full parser, past the alias.
        resolve: { mainFields: ['module', 'jsnext:main', 'jsnext', 'main'] },
        test: {
          name: 'unit',
          environment: 'jsdom',
          include: ['src/**/*.test.ts', 'scripts/**/*.test.ts'],
          exclude: [...configDefaults.exclude, ...BROWSER_TESTS],
          server: { deps: { inline: ['intl-messageformat'] } },
          setupFiles: ['src/test/setup.ts', 'src/test/setup-jsdom.ts'],
          // Like identity-obj-proxy on master: styles.planButton is 'planButton'.
          css: { modules: { classNameStrategy: 'non-scoped' } },
        },
      },
      {
        extends: true,
        test: {
          name: 'browser',
          include: BROWSER_TESTS,
          setupFiles: ['src/test/setup.ts'],
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
        // They skip src/test/setup.ts, because they never load code from src/.
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
