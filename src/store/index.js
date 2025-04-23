import Vue from 'vue'
import Vuex from 'vuex'
import ecosystem from './modules/ecosystem' // 导入 ecosystem 模块

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
  },
  getters: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    ecosystem // 注册 ecosystem 模块
  }
})
