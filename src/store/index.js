import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export function createStore() {
    return new Vuex.Store({
        state: {
            text: '',
            welcomeText: ''
        },
        actions: {
            fetch({ commit }, text) {
                return new Promise((resolve, reject) => {
                    commit('TETX_CHANGE', { text })
                    resolve()
                })
            },
            fetchWelcomeData({ commit }, text) {
                return new Promise((resolve, reject) => {
                    commit('WELCOMETETX_CHANGE', { text })
                    resolve()
                })
            }
        },
        mutations: {
            ['TETX_CHANGE'](state, payload) {
                state.text = payload.text
            },
            ['WELCOMETETX_CHANGE'](state, payload) {
                state.welcomeText = payload.text
            }
        }
    })
}