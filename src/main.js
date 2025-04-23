import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// 引入 three.js
import * as THREE from 'three'

// 引入 vue-chartjs 相关组件（按需引入）
import { Bar, Line, Pie, Doughnut } from 'vue-chartjs'

// 注册全局图表组件（可选，也可以在单个组件中局部注册）
Vue.component('BarChart', Bar)
Vue.component('LineChart', Line)
Vue.component('PieChart', Pie)
Vue.component('DoughnutChart', Doughnut)

// 将 THREE 挂载到 Vue 原型，方便全局访问
Vue.prototype.$THREE = THREE

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')