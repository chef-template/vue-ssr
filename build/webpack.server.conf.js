var path = require('path')
var webpack = require('webpack')
var merge = require('webpack-merge')
var nodeExternals = require('webpack-node-externals')
var webpackBaseConfig = require('./webpack.base.conf')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var VueSSRServerPlugin = require('vue-server-renderer/server-plugin')

module.exports = merge(webpackBaseConfig, {
    entry: {
        main: [path.resolve(process.cwd(), 'src/entry-server.js')]
    },
    target: 'node',
    output: {
        libraryTarget: 'commonjs2'
    },
    externals: nodeExternals({
        whitelist: /\.css$/
    }),
    plugins: [
        new webpack.DefinePlugin(getDefinePluginConfig()),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        }),
        new ExtractTextPlugin('css/[name].[hash:7].css'),
        new VueSSRServerPlugin()
    ]
})

function getDefinePluginConfig() {
    let config = {
        'process.env': {
            VUE_ENV: '"server"',
            NODE_ENV: `"${process.env.NODE_ENV}"`
        }
    }

    return config
}