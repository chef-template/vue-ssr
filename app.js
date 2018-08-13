const PORT = process.argv[2] || 8080
const SERVER_SSR_JSON = 'vue-ssr-server-bundle.json'
const CLIENT_SSR_JSON = 'vue-ssr-client-manifest.json'

let fs = require('fs')
let app = require('koa')()
let path = require('path')
let serve = require('koa-static')
let createBundleRenderer = require('vue-server-renderer').createBundleRenderer

let template = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8')
let serverBundle = JSON.parse(fs.readFileSync(path.join(__dirname, SERVER_SSR_JSON), 'utf-8'))
let clientManifest = JSON.parse(fs.readFileSync(path.join(__dirname, CLIENT_SSR_JSON), 'utf-8'))
let renderer = createBundleRenderer(serverBundle, {
    template,
    basedir: '',
    clientManifest,
    runInNewContext: false
})

app.use(serve(__dirname))
app.use(function* (next) {
    try {
        this.body = yield getContent(this.url, this.cookies)
    } catch(err) {
        if (err.code === 403 && err.redirectUrl) {
            this.redirect(err.redirectUrl)
        } else {
            console.log(err)
        }
    }
})
app.listen(PORT, (err) => {
    if (err) { return console.log(err) }
    console.log(`app started in localhost:${PORT}`)
})

function getContent(url, cookies) {
    return new Promise((resolve, reject) => {
        renderer.renderToString({ url, cookies }, (err, html) => {
            if (err) {return reject(err) }
            resolve(html)
        })
    })
}