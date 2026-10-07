import { resolve } from 'node:path'

import { defineConfig } from 'vitest/config'

// Every test runs in UTC unless it sets another zone.
process.env.TZ = 'UTC'

export default defineConfig({
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
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
    ],
  },
})
