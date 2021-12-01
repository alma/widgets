const copy = require('rollup-plugin-copy')

module.exports = {
  plugins: {
    typescript: function (config) {
      // Since imported *.svg will be transformed to ES modules by the image plugin, tell
      // TypeScript to process them
      return {
        ...config,
        include: ['*.ts+(|x)', '**/*.ts+(|x)', '*.s?css', '*.svg', '**/*.svg'],
        objectHashIgnoreUnknownHack: true,
      }
    },
  },

  config: function (config, context) {
    const {
      format,
      options: { pkg },
    } = context

    config.inputOptions.plugins.splice(
      0,
      0,
      copy({
        targets: [
          {
            src: [
              'src/assets/fonts/PublicSans-VariableFont_wght.ttf',
              'src/assets/fonts/Eina04-Bold.woff',
              'src/assets/fonts/Eina04-Bold.ttf',
            ],
            dest: 'dist/assets/fonts',
          },
        ],
      }),
    )

    // When building browser "standalone" bundles, make sure we inline dependencies
    if (format === 'umd') {
      const _external = config.inputOptions.external
      config.inputOptions.external = (id, ...args) => {
        if (
          id in (pkg.dependencies || {}) ||
          id in (pkg.peerDependencies || {}) ||
          // react imports internal modules that we need inlined into the lib as well
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
