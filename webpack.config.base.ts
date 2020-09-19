import * as path from 'path';
import * as webpack from 'webpack';
const HtmlWebpackPlugin = require('html-webpack-plugin');

const config: webpack.Configuration = {
  entry: {
    index: [path.resolve(__dirname, './src/scripts/entry.tsx')],
  },
  output: {
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: [
          {
            loader: 'ts-loader',
          }
        ]
      },
      {
        test: /\.pug$/,
        use: [
          {
            loader: 'pug-loader',
            options: {
              pretty: true,
            }
          }
        ]
      },
      {
        test: /\.(jpg|png|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]',
          outputPath: (url: string) => {
            return path.relative('src', url);
          },
          publicPath: (url: string) => {
            return path.relative('src', url).replace(/\\/g, '/');
          },
          esModule: false,
        },
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
    alias: {
      '~': path.resolve(__dirname, './src/scripts/'),
      images: path.resolve(__dirname, './src/assets/images/'),
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname, './src/pug/index.pug'),
      hash: true,
      inject: true,
    }),
  ],
};

export default config;
