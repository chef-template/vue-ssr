import Vue from 'vue'
import routes from './map'
import Router from 'vue-router'

Vue.use(Router)

let notFound = {
    path: '*',
    meta: { title: '404' },
    component: {render: (h) => h('h1', '404 not found')}
}

if (process.env.VUE_ENV === 'client') {
    window.history.replaceState = window.history.replaceState || function(){}
}

export function createRouter() {
    let router = new Router({
        mode: 'history',
        fallback: false,
        base: process.env.ROUTER_ROOT,
        routes: Object.keys(routes).reduce((previous, current) => {
            return (previous.push({path: current, ...routes[current]}), previous)
        }, []).concat(notFound),
        scrollBehavior(to, from, savedPosition) {
            return { x: 0, y: 0 }
        }
    })

    router.onError((err) => {
        if (err.message === 'Permission denied') {
            let redirectUrl = (router.options.routes.filter((route) => route.meta.redirect)[0] || { path: '' }).path
            
            router.push(`${router.options.base}${redirectUrl}`.replace(/\/\//ig, '/'))
        }
    })

    return router
}