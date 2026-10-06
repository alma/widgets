import type { StorybookConfig } from '@storybook/web-components-vite'

// Plugins of vite.config.ts that only make sense when building the published library
const LIBRARY_BUILD_PLUGINS = ['vite:dts', 'minify-css']

const config: StorybookConfig = {
  stories: ['../src/stories/**/*.stories.ts'],
  framework: '@storybook/web-components-vite',
  core: { disableTelemetry: true },
  // Storybook reuses vite.config.ts (aliases, preact/compat, CSS modules) but builds an app, not
  // the library: drop the library entry and the plugins that write type declarations and
  // widgets.min.css into dist/.
  viteFinal: (viteConfig) => ({
    ...viteConfig,
    build: { ...viteConfig.build, lib: false },
    plugins: viteConfig.plugins
      ?.flat()
      .filter(
        (plugin) => !(plugin && 'name' in plugin && LIBRARY_BUILD_PLUGINS.includes(plugin.name)),
      ),
  }),
}

export default config
