import { createApp } from './entry'

export default function(context) {
    return new Promise((resolve, reject) => {
        const { app, router, store, http } = createApp(context.cookies)
        
        router.push(context.url.replace(router.options.base, ''))

        router.onReady(() => {
            const matchedComponents = router.getMatchedComponents()

            if (!matchedComponents.length) {
                return reject({ code: 404 })
            }

            let meta = Object.assign({}, router.currentRoute.meta || {})

            if (meta.auth && !context.cookies.get(meta.auth)) {
                return reject({
                    code: 403,
                    redirect: meta.redirect,
                    message: 'Permission denied'
                })
            }
            
            Promise.all(matchedComponents.map((Component) => {
                if (Component.asyncData) {
                    return Component.asyncData({
                        http,
                        meta,
                        store,
                        cookies: context.cookies,
                        $isServer: app.$isServer,
                        route: router.currentRoute
                    })
                }
            })).then(() => {
                let { title, keywords, description } = meta

                context.state = store.state
                context.title = title || ''
                context.keywords = keywords || ''
                context.description = description || ''

                resolve(app)
            }).catch(reject)
        }, reject)
    })
}