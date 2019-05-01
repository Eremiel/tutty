const path = require('path');

module.exports = {
    entry: {
      server: './src/server/bin/index.ts',
    },
    module: {

      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        }]
    },
    resolve: {
      extensions: [ '.tsx', '.ts', '.js' ]
    },
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'dist/bin')
    },
    watchOptions: {
      ignored: /node_modules/
    },
    node: {
      fs: 'empty',
      net: 'empty'
    },
    mode: 'development'
};