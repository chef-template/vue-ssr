let path = require('path')
let webpack = require('webpack')
let env = require('./webpack.env')
let merge = require('webpack-merge')
let webpackBaseConfig = require('./webpack.base.conf')
let CopyWebpackPlugin = require('copy-webpack-plugin')
let ExtractTextPlugin = require('extract-text-webpack-plugin')
let VueSSRClientPlugin = require('vue-server-renderer/client-plugin')

module.exports = merge(webpackBaseConfig, {
    entry: {
        main: [path.resolve(process.cwd(), 'src/entry-client.js')]
    },
    output: {
        filename: 'js/[name].[hash].js',
        path: path.resolve(process.cwd(), 'dist'),
        publicPath: getEnv()['process.env'].publicPath
    },
    plugins: [
        new webpack.DefinePlugin(getEnv()),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks: function (module) {
                return (/node_modules/.test(module.context) && !/\.css$/.test(module.request))
            }
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'manifest'
        }),
        new ExtractTextPlugin('css/[name].[hash:7].css'),
        new VueSSRClientPlugin(),
        new CopyWebpackPlugin([
            { from: 'app.js', to: './' },
            { from: 'index.html', to: './' }
        ])
    ],
    devServer: env.develop.devServer
})

function getEnv() {
    return {
        'process.env': Object.assign({
            VUE_ENV: '"client"',
            NODE_ENV: `"${process.env.NODE_ENV}"`
        }, env[process.env.NODE_ENV])
    }
}