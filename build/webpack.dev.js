/* eslint-disable no-undef */

const webpack = require('webpack'); //访问内置的插件
const common = require('./webpack.common')
const { merge }  = require('webpack-merge')
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const path = require('path');


const devConfig = {
  mode: 'development',   // "production" | "development" | "none"
  devtool: 'cheap-module-eval-source-map',   // dev环境
  devServer:{
    contentBase: "./dist",
    open:true,
    hot: true,
    historyApiFallback: true,         // 配置前端路由
    // historyApiFallback:{
    //   rewrites:[
    //     {
    //       from:'/abc.html',
    //       to:'/index.html'
    //     },
    //   ]
    // },
    // hotOnly:true,
    proxy:{
      '/react/api':{
        target: 'http://www.dell-lee.com',
        pathRewrite:{
          'header.json': 'demo.json'
        },
        changeOrigin:true
      }
    }
  },
  output: {
    filename: '[name].bundle.js',
    chunkFilename:'[name].chunk.js',
    path: path.resolve(__dirname, '../dist'),
    publicPath: '/'
  },
  module:{
    rules:[
      {
        test:/\.less$/i,
        use:[
          'style-loader',
          {
            loader:'css-loader',
            options:{
              // 在less文件中@import一个less时也需要使用postcss-loader,less-loader进行处理
              // 这个数字表示要 先用 css-loader 下几个loader去处理。 1代表只用less-loader, 2用postcss-loader,less-loader
              importLoaders: 2, 
              // modules:true,   // 是否开启css modules
            }
          },
          'less-loader',
          'postcss-loader'
        ]
      },
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    // new BundleAnalyzerPlugin()
  ],
  optimization:{
    usedExports:true,
  }
};

module.exports = merge(common,devConfig)