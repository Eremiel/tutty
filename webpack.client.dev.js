const path = require('path');

module.exports = {
    entry: {
      client: './src/client/index.ts',
    },
    module: {

      rules: [
        {
          test: /\.scss$/,
          use: [
              "style-loader", // creates style nodes from JS strings
              "css-loader", // translates CSS into CommonJS
              "sass-loader" // compiles Sass to CSS, using Node Sass by default
          ]
        },{
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
    mode: 'development'
};