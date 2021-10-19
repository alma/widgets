const image = require('@rollup/plugin-image')
const tailwind = require('tailwindcss')
const assets = require('postcss-assets')

module.exports = {
  plugins: {
    postcss: function (config) {
      // Inject TailwindCSS into the PostCSS config
      return {
        ...config,
        plugins: [
          tailwind(),
          ...config.plugins,
          assets({
            basePath: './src',
          }),
        ],
      }
    },

    typescript: function (config) {
      // Since imported *.svg will be transformed to ES modules by the image plugin, tell
      // TypeScript to process them
      return { ...config, include: ['*.ts+(|x)', '**/*.ts+(|x)', '*.s?css', '*.svg', '**/*.svg'] }
    },
  },

  config: function (config, context) {
    const {
      format,
      options: { pkg },
    } = context

    // Add image plugin right after json plugin
    const jsonIdx = config.inputOptions.plugins.findIndex((p) => p.name === 'json')
    config.inputOptions.plugins = [
      ...config.inputOptions.plugins.slice(0, jsonIdx + 1),
      image(),
      ...config.inputOptions.plugins.slice(jsonIdx + 1),
    ]

    config.inputOptions.plugins.splice(jsonIdx + 1, 0, image())

    // When building browser "standalone" bundles, make sure we inline dependencies
    if (format === 'umd') {
      const _external = config.inputOptions.external

      config.inputOptions.external = (id, ...args) => {
        if (
          id in (pkg.dependencies || {}) ||
          id in (pkg.peerDependencies || {}) ||
          // preact imports internal modules that we need inlined into the lib as well
          id.match(/^react\//) ||
          id.match(/\.svg$/)
        ) {
          return false
        }

        return _external(id, ...args)
      }

      // Make sure @alma/client is exported on the `Alma` global object, and deactivate cache to
      // ensure the lib is indeed inlined into the bundle
      // (see https://github.com/rollup/rollup/issues/3874)
      config.outputOptions.globals['@alma/client'] = 'Alma'
      config.inputOptions.cache = false
    }

    return config
  },
}
