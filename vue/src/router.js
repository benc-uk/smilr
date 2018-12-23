import Vue from 'vue'
import Router from 'vue-router'
import Home from './components/Home'
import About from './components/About'
import Events from './components/Events'
import Feedback from './components/Feedback'
import Error from './components/Error'
import Report from './components/Report'
import Admin from './components/Admin'
import AdminEvent from './components/AdminEvent'
import Login from './components/Login'
import { config } from './main'
import { userProfile } from './main'

Vue.use(Router)

var router = new Router({
  mode: 'history',
  routes: [
    {
      meta: {title: 'Smilr'},
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
      meta: {title: 'Smilr: Feedback Report'},
      path: '/report',
      name: 'report',
      component: Report,
      beforeEnter: validateAdminUser     
    },
    {
      meta: {title: 'Smilr: Event Admin'},
      path: '/admin',
      name: 'admin',
      component: Admin,
      beforeEnter: validateAdminUser
    },
    {
      meta: {title: 'Smilr: Event Admin'},
      path: '/admin/event/:action',
      name: 'admin-event',
      component: AdminEvent,
      props: true,
      beforeEnter: validateAdminUser    
    },
    {
      meta: {title: 'Smilr: Login'},
      path: '/login/:redir',
      name: 'login',
      component: Login,
      props: true
    },
    {
      meta: {title: 'Smilr: Login'},
      path: '/login',
      name: 'loginplain',
      component: Login
    }
  ]
})

//
// Validate user is logged-in and in the authorised users list
//
function validateAdminUser(to, from, next) {
  if(!userProfile.user) {
    next({name: 'login', params: { redir: to.name}})
  } else {
    if(!userProfile.isAdmin) {
      next({name: 'error', replace: true, params: { message: `User '${userProfile.user.displayableId}' is not an administrator for this application` }})
      return;      
    }
    next()
  }
}

router.beforeEach((to, from, next) => {
  // Check config for API_ENDPOINT, if it's not set whole app is screwed
  if(!config.API_ENDPOINT && to.name != 'error') {
    next({name: 'error', replace: true, params: { message: 'API_ENDPOINT is not set, app can not function without it' }})
    return;
  }

  // Update page title based on route
  document.title = process.env.NODE_ENV == 'development' ? to.meta.title + ' [DEV]' : to.meta.title
  next()
})

export default router;