import Vue from 'vue'
import { createApp } from './entry'
import cookies from 'utils/cookies'

const { app, router, store, http } = createApp(cookies)

Vue.mixin({
    beforeRouteUpdate(to, from, next) {
        let meta = Object.assign({}, to.meta || {})

        if (meta.auth && !cookies.get(meta.auth)) {
            let redirectUrl = (router.options.routes.filter((route) => route.meta.redirect)[0] || { path: '' }).path

            return next(new PermissionError({
                message: 'Permission denied',
                redirectUrl: `${router.options.base}${redirectUrl}?redirect=${router.options.base}${to.fullPath}`.replace(/\/\//ig, '/')
            }))
        }
        
        if (this.$options.asyncData) {
            this.$options.asyncData({
                http,
                meta,
                route: to,
                store: this.$store,
                $isServer: app.$isServer
            }).then(() => refreshMeta(meta, next)).catch(next)
        } else {
            refreshMeta(meta, next)
        }
    }
})

if (window.__INITIAL_STATE__) {
    store.replaceState(window.__INITIAL_STATE__)
}

router.onReady(() => {
    router.beforeResolve((to, from, next) => {
        let matched, prevMatched, diffed, activated, hooks, meta

        diffed = false
        meta = Object.assign({}, to.meta || {})
        matched = router.getMatchedComponents(to)
        prevMatched = router.getMatchedComponents(from)
        activated = matched.filter((item, index) => diffed || (diffed = (prevMatched[index] !== item)))
        hooks = activated.map((item) => item.asyncData).filter((item) => item)

        if (meta.auth && !cookies.get(meta.auth)) {
            let redirectUrl = (router.options.routes.filter((route) => route.meta.redirect)[0] || { path: '' }).path

            return next(new PermissionError({
                message: 'Permission denied',
                redirectUrl: `${router.options.base}${redirectUrl}?redirect=${router.options.base}${to.fullPath}`.replace(/\/\//ig, '/')
            }))
        }
        
        if (!hooks.length) {
            return refreshMeta(meta, next)
        }
        
        Promise.all(hooks.map((hook) => hook({
            http,
            meta,
            store,
            route: to,
            $isServer: app.$isServer
        }))).then(() => refreshMeta(meta, next)).catch(next)
    })
    
    app.$mount('#app')
})

function refreshMeta(meta, next) {
    let { title, keywords, description } = meta

    document.title = title || ''
    document.querySelector('meta[name="keywords"]').content = keywords || ''
    document.querySelector('meta[name="description"]').content = description || ''

    next()
}

class PermissionError extends Error {
    constructor(opts) {
        super()
        
        this.code = 403
        this.message = opts.message
        this.redirectUrl = opts.redirectUrl

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}