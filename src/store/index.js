import { createStore } from 'vuex'
import { version } from "../../package.json";

const store = createStore({
    state() {
        return {
            version: version,
            user: null,
            //data存储每张表查询出来的记录 {"user": [{"id": 1,...}], "file": [{"id": 1,...}]}
            data: null,
            //params存储每张表查询参数 {"user": {"offset": 0,"limit": 10, "keywords": ""}, "file": {...}}
            params: null
        }
    },
    getters: {
        perms: (state) => {
            let perms = null
            if (state.user != null) {
                perms = state.user.perms
            }
            return perms
        },
        data: (state) => (key) => {
            let data = []
            if (state.data && state.data[key]) {
                data = state.data[key]
            }
            return data
        },
        params: (state) => (key) => {
            return state.params && state.params[key] ? state.params[key] : { offset: 0, limit: 10, keyword: '' }
        },
        username: (state) => {
            return state.user ? state.user.username : null
        },
        isLogin: (state) => {
            return state.user != null && state.user.username != "anonymous"
        },
        avatarText: (state) => {
            let text = "登录"
            if (state.user != null && state.user.username != "anonymous") {
                text = state.user.name || state.user.username
            }
            return text
        }
    },
    mutations: {
        setVersion(state, payload) {
            state.version = payload
        },
        setUser(state, payload) {
            state.user = payload
        },
        setData(state, payload) {
            if (payload == null) {
                state.data = null
            } else {
                if (state.data == null) state.data = {}
                for (let key in payload) {
                    state.data[key] = payload[key]
                }
            }

        },
        setParams(state, payload) {
            if (payload == null) {
                state.params = null
            } else {
                if (state.params == null) state.params = {}
                for (let key in payload) {
                    state.params[key] = payload[key]
                }
            }
        },
        //修改某个Data，payload样例 {"user": {"id": 1,...}}
        updateData(state, payload) {
            for (let key in payload) {
                if (state.data != null && Array.isArray(state.data[key])) {
                    const f = state.data[key].find(el => el.id != null && el.id == payload[key].id)
                    if (f) Object.assign(f, payload[key])
                }
            }
        },
        //追加Data，payload样例 {"user": [{"id": 1,...}...]}
        addData(state, payload) {
            for (let key in payload) {
                if (state.data == null) state.data = { [key]: [] }
                payload[key].forEach(el => {
                    const f = state.data[key].find(el1 => el1.id != null && el1.id == el.id)
                    if (f) Object.assign(f, el)
                    else state.data[key].push(el)
                })
            }
        },
        //更新某个Params，payload样例 {"user": {"offset": 10,...}}
        updateParams(state, payload) {
            for (let key in payload) {
                Object.assign(state.params[key], payload[key])
            }
        }
    }
})

export default store
