let fs = require('fs')
let app = require('koa')()
let path = require('path')
let chalk = require('chalk')
let proxy = require('koa-proxy')
let webpack = require('webpack')
let MemoryFs = require('memory-fs')
let clientConfig = require('../build/webpack.client.conf.js')
let serverConfig = require('../build/webpack.server.conf.js')
let webpackDevMiddleware = require('koa-webpack-dev-middleware')
let webpackHotMiddleware = require('koa-webpack-hot-middleware')
let createBundleRenderer = require('vue-server-renderer').createBundleRenderer

const SERVER_SSR_JSON = 'vue-ssr-server-bundle.json'
const CLIENT_SSR_JSON = 'vue-ssr-client-manifest.json'
const HOT_MIDDLEWARE_CLIENT = 'webpack-hot-middleware/client'
const DEV_MIDDLEWARE_OPTION = {
    hot: true,
    quiet: true,
    noInfo: true,
    publicPath: clientConfig.output.publicPath
}

let memoryFs, clientCompiler, serverCompiler, devMiddleware, hotMiddleware, devServer, template, renderer, clientManifest, serverBundle, port

memoryFs = new MemoryFs()
template = readFileSync(fs, __dirname, '../index.html')
devServer = Object.assign({}, { port: 8080 }, clientConfig.devServer)
port = process.argv[2] || devServer.port

clientConfig.plugins.push(
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
)

if (Array.isArray(clientConfig.entry)) {
    clientConfig.entry.unshift(HOT_MIDDLEWARE_CLIENT)
} else {
    Object.keys(clientConfig.entry).map((item) => clientConfig.entry[item].unshift(HOT_MIDDLEWARE_CLIENT))
}

clientCompiler = webpack(clientConfig)
serverCompiler = webpack(serverConfig)
serverCompiler.outputFileSystem = memoryFs
hotMiddleware = webpackHotMiddleware(clientCompiler)
devMiddleware = webpackDevMiddleware(clientCompiler, DEV_MIDDLEWARE_OPTION)

clientCompiler.plugin('done', (stats) => {
    stats = stats.toJson()
    stats.errors.forEach(err => console.error(err))
    stats.warnings.forEach(err => console.warn(err))

    if (stats.errors.length) {
        return
    }

    clientManifest = JSON.parse(readFileSync(devMiddleware.fileSystem, clientCompiler.outputPath, CLIENT_SSR_JSON))
    createRenderer()
})

serverCompiler.watch({}, (err, stats) => {
    stats = stats.toJson()

    if (err) {
        throw err
    }

    if (stats.errors.length) {
        return
    }
    
    serverBundle = JSON.parse(readFileSync(memoryFs, clientCompiler.outputPath, SERVER_SSR_JSON))
    createRenderer()
})

if(devServer.proxy){
    app.use(proxy(devServer.proxy))
}
app.use(function *(next) {
    if (this.url === '/favicon.ico') { return }
    yield *next
})
app.use(devMiddleware)
app.use(hotMiddleware)
app.use(function* (next) {
    this.body = yield getContent(this.url, this.cookies)
})
app.listen(port, (err) => {
    if (err) {
        console.log(err)
        return
    }

    console.log(chalk.blue(' # Access URLs:'))
    console.log(chalk.gray(' ----------------------------------------'))
    console.log('     Local: ' + chalk.green('http://localhost:' + port))
    console.log(chalk.gray(' ----------------------------------------'))
    console.log('')
})

function readFileSync(obj, ...args) {
    return obj.readFileSync(path.join(...args), 'utf-8')
}

function createRenderer() {
    if (!serverBundle || !clientManifest) {
        return
    }

    renderer = createBundleRenderer(serverBundle, {
        template,
        clientManifest,
        runInNewContext: false
    })
}

function getContent(url, cookies) {
    return new Promise((resolve, reject) => {
        renderer.renderToString({ url, cookies }, (err, html) => {
            if (err) {
                return reject(err)
            }

            resolve(html)
        })
    })
}