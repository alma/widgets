import { defineConfig } from 'vitest/config'

import { alias, define } from './vite.config'

// Every test runs in UTC unless it sets another zone.
process.env.TZ = 'UTC'

export default defineConfig({
  // Same alias and env values as the build.
  resolve: { alias },
  define,
  test: {
    globals: true,
    coverage: { provider: 'v8' },
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'jsdom',
          include: ['src/**/*.test.ts'],
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
