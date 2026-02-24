import { playwrightLauncher } from '@web/test-runner-playwright'
import { esbuildPlugin } from '@web/dev-server-esbuild'

export default {
  files: 'src/**/*.test.ts',
  nodeResolve: true,
  coverage: true,
  coverageConfig: {
    threshold: {
      statements: 70,
      branches: 58,
      functions: 70,
      lines: 70,
    },
  },
  browsers: [playwrightLauncher({ product: 'chromium' })],
  plugins: [
    esbuildPlugin({
      ts: true,
      target: 'es2020',
      tsconfig: './tsconfig.json',
      loaders: { '.ts': 'ts' },
    }),
  ],
  testFramework: {
    config: {
      timeout: 15000,
    },
  },
}
