const path = require('path');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const sass = require('sass');
const WorkboxPlugin = require('workbox-webpack-plugin');

module.exports = (env, argv) => {
  const basePath = __dirname;
  const isProduction = argv.mode === 'production';

  const faviconsWebpackPluginSettings = {
    logo: path.resolve('src/images/icon.png'),
    inject: true,
  };

  if (isProduction) {
    faviconsWebpackPluginSettings.prefix = '';
    faviconsWebpackPluginSettings.publicPath = '.';
  }

  return {
    entry: {
      bundle: ['./src/index.jsx'],
    },
    devtool: isProduction ? undefined : 'source-map',
    devServer: {
      contentBase: basePath,
      compress: true,
      port: process.env.PORT,
    },
    resolve: {
      extensions: ['.webpack.js', '.js', '.jsx', '.json', '.png'],
    },
    plugins: [
      ...(isProduction ? [new CleanWebpackPlugin()] : []),
      new FaviconsWebpackPlugin(faviconsWebpackPluginSettings),
      new HtmlWebpackPlugin({
        template: './src/index.html',
      }),
      ...(isProduction ? [new WorkboxPlugin.GenerateSW({
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [{
          urlPattern: new RegExp('https://raw.githubusercontent.com'),
          handler: 'StaleWhileRevalidate',
        }],
      })] : []),
    ],
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          use: [
            'babel-loader',
          ],
          exclude: '/node_modules',
        },
        {
          test: /\.(s*)css$/,
          use: ['style-loader', 'css-loader', {
            loader: 'sass-loader',
            options: {
              implementation: sass,
            },
          }],
        },
        {
          test: /\.png$/,
          use: [
            {
              loader: 'url-loader',
            },
          ],
        },
      ],
    },
    node: {
      fs: 'empty',
    },
    mode: isProduction ? 'production' : 'development',
  };
};
