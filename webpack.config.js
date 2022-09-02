const path = require('path');
const webpack = require('webpack')
module.exports = {
  context: path.resolve(__dirname, 'src'),
  entry: {
    'web4-browser': ['@babel/polyfill', './index.js'],
  },
  plugins: [
    new webpack.IgnorePlugin(/^\.\/wordlists\/(?!english)/, /bip39\/src$/),
    new webpack.NormalModuleReplacementPlugin(
      /@ledgerhq\/devices\/hid-framing/,
      '@ledgerhq/devices/lib/hid-framing'
    ),
  ],
  output: {
    filename: `[name].js`,
    path: path.resolve(__dirname, 'dist'),
    library: 'web4',
    libraryTarget:'umd',
    umdNamedDefine: true,
    globalObject: `(typeof self !== 'undefined' ? self : this)`
  },
  resolve: {
    modules: [
      'node_modules'
    ],
    extensions: ['.js', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env'
              ],
              plugins: [
                '@babel/plugin-proposal-class-properties'
              ]
            }
          }
        ]
      }
    ]
  },
  node: {
    fs: 'empty'
  }
}