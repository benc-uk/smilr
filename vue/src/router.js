import { createRouter, createWebHashHistory } from 'vue-router'

import Home from './components/Home'
import About from './components/About'
import Events from './components/Events'
import Feedback from './components/Feedback'
import Error from './components/Error'
import Report from './components/Report'
import Admin from './components/Admin'
import AdminEvent from './components/AdminEvent'
import Login from './components/Login'

import auth from './services/auth'

// Vue.use(Router)

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      meta: { title: 'Smilr' },
      path: '/',
      name: 'home',
      component: Home
    },
    {
      meta: { title: 'Smilr: About' },
      path: '/about',
      name: 'about',
      component: About
    },
    {
      meta: { title: 'Smilr: Events' },
      path: '/events',
      name: 'events',
      component: Events
    },
    {
      path: '/feedback/',
      name: 'feedback',
      component: Feedback,
      props: true
    },

    // Used when trapping errors
    {
      meta: { title: 'Smilr: Error' },
      path: '/error',
      name: 'error',
      component: Error,
      props: true
    },

    // These three routes have a guard checking for logged in user
    {
      meta: { title: 'Smilr: Feedback Report' },
      path: '/report',
      name: 'report',
      component: Report,
      beforeEnter: checkLoggedIn
    },
    {
      meta: { title: 'Smilr: Event Admin' },
      path: '/admin',
      name: 'admin',
      component: Admin,
      beforeEnter: checkLoggedIn
    },
    {
      meta: { title: 'Smilr: Event Admin' },
      path: '/admin/event/:action',
      name: 'admin-event',
      component: AdminEvent,
      props: true,
      beforeEnter: checkLoggedIn
    },

    // Login, only used when AAD_CLIENT_ID is set
    {
      meta: { title: 'Smilr: Login' },
      path: '/login/:redir',
      name: 'login',
      component: Login,
      props: true
    },
    {
      meta: { title: 'Smilr: Login' },
      path: '/login',
      name: 'loginplain',
      component: Login
    },

    // Catch all route, redirects to Error without props, so will redirect to Home
    {
      meta: { title: 'Smilr: Error' },
      path: '/:catchAll(.*)',
      name: 'error-noprops',
      component: Error,
    }
  ]
})

//
// Validate user is logged-in
//
function checkLoggedIn(to, from, next) {
  if (auth.clientId()) {
    const user = auth.user()

    // If no user object - redirect to Login
    if (!user || !user.userName) {
      next({ name: 'login', params: { redir: to.name } })
      return
    }
  }
  next()
}

//
// All routes go through this check, it catches some low level errors
//
router.beforeEach((to, from, next) => {
  // Update page title based on route
  document.title = process.env.NODE_ENV == 'development' ? to.meta.title + ' [DEV]' : to.meta.title
  next()
})

export default router