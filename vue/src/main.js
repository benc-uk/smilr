// Core Vue stuff
import Vue from 'vue'
import App from './App'
import router from './router'
import auth from './mixins/auth'

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
//let userProfile = {}

export { config }

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
async function initApp() {
  console.log(`### App running in ${process.env.NODE_ENV} mode`)
  console.log('### App config is', config)

  // MSAL used for signing in users with MS identity platform
  if (config.AAD_CLIENT_ID) {
    console.log(`### Azure AD sign-in: enabled. Using clientId: ${config.AUTH_CLIENT_ID}`)
    auth.methods.authInitMsal(config.AAD_CLIENT_ID, [ 'smilr.events' ])
  } else {
    console.log('### Azure AD sign-in: disabled. Will run in demo mode')
  }

  // Re-login any locally cached user, if there is one
  // Note, we're using a mixin *outside* a component, so the slightly strange access
  await auth.methods.authRestoreUser()

  // Mount the top level App component
  // Taken from Vue CLI template app, don't really understand what it all does
  new Vue({
    router,
    beforeCreate: function() { },
    render: function (h) { return h(App) }
  }).$mount('#app')
}


