var path = require('path')
var webpack = require('webpack')

module.exports = {
  entry: './_app/main.js',
  output: {
    path: path.join(__dirname, 'assets/js'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: { 
          loader: 'babel-loader', 
          options: {
            presets: ['@babel/preset-env']
          }
        },
      },
    ]
  },
  resolve: {
    extensions: ['.js', '.json'],
    alias: {
        jquery: "jquery/src/jquery"
    }
  },

  plugins: [
    new webpack.ProvidePlugin({
      "_": "underscore",
      $: "jquery",
      jQuery: "jquery"
    })
  ]
};
