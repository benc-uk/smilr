// Core Vue stuff
import Vue from 'vue'
import App from './App'
import router from './router'

// Bootstrap and theme
import BootstrapVue from 'bootstrap-vue'
Vue.use(BootstrapVue);
import 'bootswatch/dist/materia/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

// Other plugins
Vue.use(require('vue-moment'));

// Font Awesome
import { library as faLibrary } from '@fortawesome/fontawesome-svg-core'
import { faHome, faInfoCircle, faCoffee, faSpinnerThird, faCalendarAlt, faFlask, faChalkboardTeacher, faLaptopCode, faTools, faChartBar } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
faLibrary.add(faHome) // Add your icons here
faLibrary.add(faInfoCircle)
faLibrary.add(faCoffee)
faLibrary.add(faSpinnerThird)
faLibrary.add(faCalendarAlt)
faLibrary.add(faFlask)
faLibrary.add(faChalkboardTeacher)
faLibrary.add(faLaptopCode)
faLibrary.add(faTools)
faLibrary.add(faChartBar)
Vue.component('fa', FontAwesomeIcon)

/* ================================================================================================== */

/* eslint-disable */
Vue.config.productionTip = false

// config is a global object created and populated here and exported for other code to use
var config = {}
export default config;

console.log(`### App starting running in ${process.env.NODE_ENV} mode`)

// In production mode fetch config at runtime from /.config endpoint
// This assumes the SPA is being served by the Smilr frontend Node server
if(process.env.NODE_ENV != 'development') {
  fetch(`/.config/API_ENDPOINT`)
  .then(resp => {
    resp.json()
    .then(result => {
      // Store results as our global config object, then init the app
      config.API_ENDPOINT = result.API_ENDPOINT
      initApp()
    })
    .catch(err => {
      console.log(`### Unable to fetch config from server. App will not start! Err: ${err}`);
    })
  })
  .catch(err => {
    console.log(`### Unable to fetch config from server. App will not start! Err: ${err}`);
  })
} else {
  // In dev mode fetch config from static .env file
  config.API_ENDPOINT = process.env.VUE_APP_API_ENDPOINT
  initApp()
}


//
// It all starts here, create the Vue instance and mount the app component
//
function initApp() {
  new Vue({
    router,
    render: function (h) { return h(App) },
    beforeCreate: function() { }
  }).$mount('#app')
}


