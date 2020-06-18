// Core Vue stuff
import Vue from 'vue'
import App from './App'
import router from './router'

// Bootstrap and theme
import BootstrapVue from 'bootstrap-vue'
Vue.use(BootstrapVue)
import 'bootstrap-vue/dist/bootstrap-vue.css'

// Select Bootswatch theme :)
import 'bootswatch/dist/cosmo/bootstrap.css'
//import 'bootswatch/dist/slate/bootstrap.css'

// Other plugins
Vue.use(require('vue-moment'))

// Font Awesome
import { library as faLibrary } from '@fortawesome/fontawesome-svg-core'
import { faHome, faInfoCircle, faCoffee, faCalendarAlt, faFlask, faChalkboardTeacher, faLaptopCode,
  faTools, faChartBar, faSync, faEdit, faTrashAlt,
  faCalendarPlus, faPlusSquare, faUser } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
faLibrary.add(faHome, faInfoCircle, faCoffee, faSync, faCalendarAlt, faFlask, faChalkboardTeacher,
  faLaptopCode, faTools, faChartBar, faEdit, faTrashAlt, faCalendarPlus, faPlusSquare, faUser)
Vue.component('fa', FontAwesomeIcon)

/* ================================================================================================== */

Vue.config.productionTip = false

// Global object created and populated here and exported for other code to use
let config = {}
// Global user profile object
let userProfile = {}

export { userProfile, config }

// In production mode fetch config at runtime from special .config endpoint
// This REQUIRES the SPA is being served by the Smilr frontend Node server
if (process.env.NODE_ENV == 'production') {
  fetch('.config/API_ENDPOINT,AAD_CLIENT_ID')
    .then((resp) => {
      resp.json()
        .then((result) => {
          // Store results as our global config object, then init the app
          config.API_ENDPOINT = result.API_ENDPOINT
          config.AAD_CLIENT_ID = result.AAD_CLIENT_ID
          initApp()
        })
        .catch((err) => {
          console.log(`### Unable to fetch config from server. App will not start! Err: ${err}`)
        })
    })
    .catch((err) => {
      console.log(`### Unable to fetch config from server. App will not start! Err: ${err}`)
    })
} else {
  // In dev mode fetch config from static .env file, note the VUE_APP_ prefix
  // The Vue CLI webpack bundling will populate these from `.env.development.local`
  console.log(`### VUE_APP_API_ENDPOINT=${process.env.VUE_APP_API_ENDPOINT}`)

  config.API_ENDPOINT = process.env.VUE_APP_API_ENDPOINT
  config.AAD_CLIENT_ID = process.env.VUE_APP_AAD_CLIENT_ID
  initApp()
}

//
// It all starts here, create the Vue instance and mount the app component
//
function initApp() {
  console.log(`### App running in ${process.env.NODE_ENV} mode`)
  console.log('### App config is', config)

  // Check if security enabled
  if (config.AAD_CLIENT_ID) {
    userProfile = {
      user: null
    }
  } else {
    // Already log in as fake admin user, bypassing all auth and login stuff
    userProfile = {
      user: {
        name: '[Auth Disabled]'
      },
      isAdmin: true
    }
  }

  // Mount the top level App component
  // Taken from Vue CLI template app, don't really understand what it all does
  new Vue({
    router,
    beforeCreate: function() { },
    render: function (h) { return h(App) }
  }).$mount('#app')
}


