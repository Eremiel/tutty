const path = require('path');

var nodeExternals = require('webpack-node-externals');

module.exports = {
    entry: {
      server: './src/server/bin/index.ts',
    },
    target: 'node',
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
    //externals: (ctx, req, done) => (/^node-pty$/.test(req) ? done(null, `commonjs ${req}`) : done()),
    externals: [nodeExternals()],
    mode: 'production'
};