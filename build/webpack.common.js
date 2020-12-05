/* eslint-disable no-undef */
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin'); //通过 npm 安装
// const ExtractTextPlugin = require("extract-text-webpack-plugin");
const webpack = require('webpack'); //访问内置的插件
const AddAssetHtmlWebpackPlugin = require('add-asset-html-webpack-plugin');
const path = require('path')
const fs = require('fs');
const plugins = [
    // new ExtractTextPlugin("styles.css"),
    // new UglifyJsPlugin(),
    new CleanWebpackPlugin(),
    new webpack.ProgressPlugin(),
    new HtmlWebpackPlugin({template: './index.html'}),
    // new ExtractTextPlugin("styles.css"),
    new webpack.DefinePlugin({
      ENV: JSON.stringify('process.env.NODE_ENV')
    }),
    // new webpack.ProvidePlugin({
    //   _: 'lodash',
    //   _join: ['lodash','join']
    // })
]

const files = fs.readdirSync(path.resolve(__dirname,'../dll'))
files.forEach(file=>{
  if(/.*\.dll.js/.test(file)){
    plugins.push(
      new AddAssetHtmlWebpackPlugin({
        filepath: path.resolve(__dirname,'../dll',file)
      }),
    )
  }
  if(/.*\.manifest.json/.test(file)){
    new webpack.DllReferencePlugin({
      manifest: path.resolve(__dirname,'../dll',file)
    })
  }
})

module.exports = {
  entry: {
    app: './src/index.js',  //build  出来的文件名是 app.js  而不是 index.js
  },
  // node:{
  //   fs:'empty',
  //   net:'empty'
  // },
  resolve:{
    extensions: ['.js','.jsx'],
    mainFiles: ['index'],
    alias: {
      '@': path.resolve(__dirname,'../')
    }
  },
  /**
   * loader 配置
   */
  module:{
    rules: [
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        use: [
          { 
            loader: 'file-loader',
            options: {
              name:'[name]_[hash].[ext]',
              outputPath:'fonts/',
            }
          },
        ]
      },
      {
        test: /\.(png|jpg|gif|jpeg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              name:'[name]_[hash].[ext]',
              outputPath:'images/',
              limit: 2048
            }
          },
        ]
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        // include: pathToFileURL.resolve(__dirname, '../src'),
        use:[
          {
            loader:'babel-loader?cacheDirectory',
            options: {
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
              plugins:[
                "@babel/plugin-syntax-dynamic-import"
              ]
              // "plugins": [       // 使用runtime 不会造成全局变量污染,一般用于 写自定义库
              //   [
              //     "@babel/plugin-transform-runtime",
              //     {
              //       "absoluteRuntime": false,
              //       "corejs": 3,
              //       "helpers": true,
              //       "regenerator": true,
              //       "useESModules": false,
              //       // "version": "7.0.0-beta.0",
              //       // proposals: true
              //     }
              //   ]
              // ]
            },
          },
          // {
          //   loader:"imports-loader",
          //   options:{
          //     wrapper: 'window'    // 设置模块内this=》window
          //   }
          // }
          {
            loader: 'eslint-loader',
            options:{
              fix:true,
            }
          }
        ],
      },
      {
        test: /\.(tsx|ts)$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
    ]
  },
  plugins: plugins,
  // [
    // new UglifyJsPlugin(),
    // new CleanWebpackPlugin(),
    // new webpack.ProgressPlugin(),
    // new HtmlWebpackPlugin({template: './index.html'}),
    // new ExtractTextPlugin("styles.css"),
    // new webpack.DefinePlugin({
    //   ENV: JSON.stringify('process.env.NODE_ENV')
    // }),
    // 添加文件到html
    // new AddAssetHtmlWebpackPlugin({
    //   filepath: path.resolve(__dirname,'../dll/vendors.dll.js')
    // }),
    // dll 引用关系文件
    // new webpack.DllReferencePlugin({
    //   manifest: path.resolve(__dirname,'../dll/vendors.manifest.json')
    // })
  // ],
  performance:false,
  optimization:{
    runtimeChunk:{
      name:'runtime'        // 将 main.js 和 vendors.js 之间的联系文件 分离出来
    },
    splitChunks:{
      chunks: 'all',
      minSize: 20000,
      // minRemainingSize: 0,
      maxSize: 0,
      minChunks: 1,       // 代码被引入了多少次才会代码分隔
      maxAsyncRequests: 6,      // 最多同时 请求数
      maxInitialRequests: 4,      // 最多入口分隔的 请求数
      automaticNameDelimiter: '~',
      // enforceSizeThreshold: 50000,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          // filename:''
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    },
  }
};