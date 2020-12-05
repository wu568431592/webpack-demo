/* eslint-disable no-undef */
const common = require('./webpack.common')
const { merge } = require('webpack-merge')
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const path = require('path');
const WorkboxPlugin = require('workbox-webpack-plugin')
const HappyPack = require("happypack")
// const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin')

const prodConfig = {
  mode: 'production',   // "production" | "development" | "none"
  output: {
    filename: '[name].[hash].bundle.js',
    chunkFilename:'[name].[hash].chunk.js',
    path: path.resolve(__dirname, '../dist'),
    publicPath: './'
  },
  devtool: 'cheap-module-source-map',   // pro环境
  module:{
    rules:[
      {
        test: /\.(js|jsx)$/i,
        use:['happypack/loader?id=babel'],
        exclude:/node_modules/
      },
      {
        test:/\.less$/i,
        use:[
          MiniCssExtractPlugin.loader,
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
  plugins:[
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].[contentHash].css', 
    }),
    new WorkboxPlugin.GenerateSW({
      clientsClaim:true,
      skipWaiting:true,
    }),
    new HappyPack({
      id: 'babel',
      loaders: [{
        loader: 'babel-loader',
        options:{
          cacheDirectory: true,
          presets: [
            ['@babel/preset-env',{      //使用presets 
              useBuiltIns: 'usage',
              corejs: 2,
              targets:{
                chrome: 59,
                edge: 13,
                firefox: 50,
              }
            }],
            [
              '@babel/preset-react' 
            ],
          ],
        }
      }]
    }),
    // new ParallelUglifyPlugin({
    //   uglifyJS:{
    //     output: {
    //       beautify: false,  // 紧凑输出
    //       comments:false, // 删除注释
    //     },
    //     compress:{
    //       drop_console: true,
    //       collapse_vars: true,  // 内嵌定义了但是只用到一次的变量
    //       reduce_vars: true, // 提取出出现多次但是没有定义成变量去引用的静态值
    //     }
    //   }
    // }),
  ],
  optimization: {
    // minimizer: [new OptimizeCSSAssetsPlugin({})],
  },
};

module.exports = merge(common, prodConfig)