import Vue from 'vue'
import App from './App'
import http from 'vue-http'
import { createStore }from './store'
import Layout from 'components/layout'
import { sync } from 'vuex-router-sync'
import { createRouter } from './router'

Vue.use(http)
Vue.component('Layout', Layout)

Vue.config.productionTip = false

export function createApp(cookies) {
    let store, router

    store = createStore()
    router = createRouter()

    sync(store, router)
    
    const app = new Vue({
        store,
        router,
        render: (h) => h(App)
    })

    return {
        app,
        store,
        router,
        http: Vue.http
    }
}