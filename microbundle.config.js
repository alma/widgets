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
      config.inputOptions.cache = false
    }

    return config
  },
}
