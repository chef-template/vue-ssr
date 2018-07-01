import Vue from 'vue'
import { createApp } from './entry'

const { app, router, store, http } = createApp()

Vue.mixin({
    beforeRouteUpdate(to, from, next) {
        let meta = Object.assign({}, to.meta || {})
        
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
        let matched, prevMatched, diffed, activated, hooks

        diffed = false
        matched = router.getMatchedComponents(to)
        prevMatched = router.getMatchedComponents(from)
        activated = matched.filter((item, index) => diffed || (diffed = (prevMatched[index] !== item)))
        hooks = activated.map((item) => item.asyncData).filter((item) => item)
        
        if (!hooks.length) {
            return next()
        }

        let meta = Object.assign({}, to.meta || {})

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