const path = require('node:path')

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        // No exclude: Babel also compiles @alma/widgets, as many merchant builds do.
        use: {
          loader: 'babel-loader',
          options: {
            babelrc: false,
            configFile: false,
            sourceType: 'unambiguous',
            presets: [
              [
                '@babel/preset-env',
                { targets: 'chrome 85, firefox 79, safari 14.1, ios_saf 14.5' },
              ],
            ],
          },
        },
      },
    ],
  },
}
