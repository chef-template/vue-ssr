<style scoped>
    p {
        padding: 20px 0;
        font-size: 40px;
        text-align: center;
    }
</style>
<template>
    <Layout>
        <p>{{ text }}</p>
        <p>{{ text2 }}</p>
    </Layout>
</template>

<script>
    export default {
        asyncData({ store, route, cookies, $isServer, meta }) {
            return store.dispatch('fetchWelcomeData', 'Welcome').then(() => {
                meta.title = 'welcome2'
                meta.keywords = 'welcome2'
                meta.description = 'welcome2'
            })
        },
        computed: {
            text() {
                return this.$store.state.welcomeText
            }
        },
        data() {
            return {
                text2: 'abc'
            }
        }
    }
</script>