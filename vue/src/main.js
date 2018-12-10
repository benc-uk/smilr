import Vue from 'vue'
import App from './App.vue'
import router from './router'

// Bootstrap and theme
import BootstrapVue from 'bootstrap-vue'
Vue.use(BootstrapVue);
import 'bootswatch/dist/materia/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.config.productionTip = false

new Vue({
  router,
  render: function (h) { return h(App) }
}).$mount('#app')
