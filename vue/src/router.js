import Vue from 'vue'
import Router from 'vue-router'
import Home from './components/Home.vue'
import About from './components/About.vue'
import Events from './components/Events.vue'

Vue.use(Router)

var router = new Router({
  routes: [
    {
      meta: {title: 'About Page - Example App'},
      path: '/',
      name: 'home',
      component: Home
    }, 
    {
      meta: {title: 'About Page - Example App'},
      path: '/about',
      name: 'about',
      component: About
    }, 
    {
      path: '/events',
      name: 'events',
      component: Events
    }
  ]
})

router.beforeEach((to, from, next) => {
  document.title = process.env.VUE_APP_TITLE
  next()
})

export default router;

/*
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'events', component: EventHistoryComponent },
  { path: 'about', component: AboutComponent },
  { path: 'feedback/:eventid/:topicid', component: FeedbackComponent },
  { path: 'admin/events', component: AdminComponent, canActivate: [UserService] },
  { path: 'admin/report', component: ReportComponent, canActivate: [UserService] },
  { path: 'logincomplete', component: AppSvcLogin }
*/
