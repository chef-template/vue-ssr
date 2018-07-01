let path = require('path')
let webpack = require('webpack')
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
        publicPath: '/',
        filename: 'js/[name].[hash].js',
        path: path.resolve(process.cwd(), 'dist')
    },
    plugins: [
        new webpack.DefinePlugin(getDefinePluginConfig()),
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
    ]
})

function getDefinePluginConfig() {
    let config = {
        'process.env': {
            VUE_ENV: '"client"',
            NODE_ENV: `"${process.env.NODE_ENV}"`
        }
    }

    return config
}