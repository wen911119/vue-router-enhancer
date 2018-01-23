export default function (router, store) {
    store.registerModule('VueRouterEnhancer', {
        namespaced: true,
        state() {
            return {
                routerStack: [],
                current: {
                    index: -1,
                    path: ''
                },
                enterType: 'push'
            }
        },
        actions: {
            push({ commit }, { url }) {
                commit('ROUTER_PUSH', url)
            },
            back({ commit }) {
                commit('ROUTER_BACK')
            }
        },
        mutations: {
            ROUTER_PUSH(state, payload) {
                if (-1 < state.current.index && state.current.index < (state.routerStack.length - 1)) {
                    state.routerStack = state.routerStack.slice(0, state.current.index + 1)
                    state.routerStack.push(payload)
                } else {
                    // 当前位于栈顶 或 空栈
                    state.routerStack.push(payload)
                }
                state.current.path = payload
                state.current.index = state.routerStack.length - 1
                state.enterType = 'push'
            },
            ROUTER_BACK(state) {
                state.current.index = state.current.index - 1
                state.current.path = state.routerStack[state.current.index]
                state.enterType = 'back'
            }
        }
    })
    var firstPath = ''
    if (router.mode === 'hash') {
        firstPath = location.hash.replace('#', '')
    } else if (router.mode === 'history') {
        firstPath = location.pathname
    }
    store.dispatch('VueRouterEnhancer/push', { url: firstPath })
    var oldPush = router.push.bind(router)
    router.push = (p, onComplete, onAbort) => {
        var onCompleteWrap = function (routerInfo) {
            store.dispatch('VueRouterEnhancer/push', { url: routerInfo.fullPath })
            if (onComplete) {
                onComplete(routerInfo)
            }
        }
        oldPush(p, onCompleteWrap, onAbort)
    }
    var oldBack = router.back.bind(router)
    router.back = () => {
        store.dispatch('VueRouterEnhancer/back')
        oldBack()
    }
    return {
        install(Vue) {
            Vue.mixin({
                created: function () {
                    if (store.state.VueRouterEnhancer.enterType) {
                        this.enterType = store.state.VueRouterEnhancer.enterType
                    }
                }
            })
        }
    }
}