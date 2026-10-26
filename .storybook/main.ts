import type { StorybookConfig } from '@storybook/web-components-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.ts'],
  // msw's worker. A root public/ folder would end up in dist/.
  staticDirs: ['./public'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: '@storybook/web-components-vite',
  core: { disableTelemetry: true },
  // Storybook reuses vite.config.ts, so the @/ alias, the process.env values and every plugin apply
  // to stories too. It builds an app, though, not the library.
  viteFinal: (viteConfig) => ({ ...viteConfig, build: { ...viteConfig.build, lib: false } }),
}

export default config
