import Vue from 'vue'
import Router from 'vue-router'
import Home from './components/Home'
import About from './components/About'
import Events from './components/Events'
import Feedback from './components/Feedback'
import Error from './components/Error'
import config from './main'

Vue.use(Router)

var router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    }, 
    {
      meta: {title: 'Smilr: About'},
      path: '/about',
      name: 'about',
      component: About
    }, 
    {
      meta: {title: 'Smilr: Events'},
      path: '/events',
      name: 'events',
      component: Events
    },
    {
      path: '/feedback/:eventId/:topicId',
      name: 'feedback',
      component: Feedback,
      props: true
    },
    {
      meta: {title: 'Smilr: Error'},
      path: '/error',
      name: 'error',
      component: Error,
      props: true
    },
    {
      meta: {title: 'Smilr: Error'},
      path: '/report',
      name: 'report',
      component: About
    },
    {
      meta: {title: 'Smilr: Error'},
      path: '/admin',
      name: 'admin',
      component: About
    }   
  ]
})

router.beforeEach((to, from, next) => {
  // Check config for API_ENDPOINT, if it's not set we are screwed
  if(!config.API_ENDPOINT && to.name != 'error') {
    next({name: 'error', replace: true, params: { message: 'API_ENDPOINT is not set, app can not function without it' }})
    return;
  }

  // Update page title
  document.title = to.meta.title || process.env.VUE_APP_TITLE || "Smilr"
  next()
})

export default router;