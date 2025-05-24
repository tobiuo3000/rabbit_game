const path = require('path');

module.exports = {
  mode: 'development',
  entry: './static/js/main.ts',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'static/dist'),
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  devtool: 'source-map',
};
