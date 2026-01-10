import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import Tasks from '../views/Tasks.vue';
import Home from '../views/Home.vue';
import Dashboard from '../views/Dashboard.vue';
import Reports from '../views/Reports.vue';
import Milestones from '../views/Milestones.vue';
import Issues from '../views/Issues.vue'
import Discuss from '../views/Discuss.vue'
import Calendar from '../views/Calendar.vue'

const routes = [
  { path: '/login', component: Login, meta: { hideShell: true } },
    {
    path: '/tasks',
    name: 'Tasks',
    component: Tasks,
    meta: { requiresAuth: true }
  },
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard',
    nema: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/reports',
    name: 'Reports',
    component: Reports,
    meta: { requiresAuth: true }
  },
  {
    path: '/milestones',
    name: 'Milestones',
    component: Milestones,
    meta: { requiresAuth: true }
  },
  { path: '/issues', name:'Issues', component: Issues, meta: { requiresAuth: true } },
  { path: '/discuss', name:'Discuss', component: Discuss, meta: { requiresAuth: true } },
  { path: '/calendar', name:'Calendar', component: Calendar, meta: { requiresAuth: true } }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('user_token');

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login'); 
  } else if (to.path === '/login' && isAuthenticated) {
    next('/dashboard'); 
  } else {
    next();
  }
});

export default router;