import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../stores/user';

const routes = [
  // Auth Routes
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false, hideShell: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { requiresAuth: false, hideShell: true }
  },
{
  path: '/projects/:id/members',
   component: () => import('@/views/Members.vue'),
  meta: { requiresAuth: true }
},
  // Main Routes
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },

  // Projects
  {
    path: '/projects',
    name: 'Projects',
    component: () => import('@/views/Projects.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/projects/:projectId/board',
    name: 'ProjectBoard',
    component: () => import('@/views/ProjectBoard.vue'),
    meta: { 
      requiresAuth: true,
      validateProject: true
    }
  },

  // Tasks
  {
    path: '/my-tasks',
    name: 'MyTasks',
    component: () => import('@/views/MyTasks.vue'),
    meta: { requiresAuth: true }
  },

  // User
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: { requiresAuth: true }
  },

  // Admin Only
  {
    path: '/manage-members',
    name: 'ManageMembers',
    component: () => import('@/views/ManageMembers.vue'),
    meta: { 
      requiresAuth: true,
      requiresAdmin: true
    }
  },

  // Other Features
  {
    path: '/reports',
    name: 'Reports',
    component: () => import('@/views/Reports.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/milestones',
    name: 'Milestones',
    component: () => import('@/views/Milestones.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/issues',
    name: 'Issues',
    component: () => import('@/views/Issues.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/discuss',
    name: 'Discuss',
    component: () => import('@/views/Discuss.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/calendar',
    name: 'Calendar',
    component: () => import('@/views/Calendar.vue'),
    meta: { requiresAuth: true }
  },

  // 404 Not Found
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();

  // Initialize user if token exists but user data is missing
  if (userStore.token && !userStore.user && !userStore.loading) {
    try {
      console.log('🔄 Initializing user on route change...');
      await userStore.initialize();
    } catch (err) {
      console.error("Auth initialization failed", err);
      userStore.logout();
    }
  }

  const isAuthenticated = !!userStore.token && !!userStore.user;
  const isAdmin = userStore.user?.role === 'admin';

  // Check if route requires authentication
  if (to.meta.requiresAuth && !isAuthenticated) {
    console.log('🔒 Route requires auth, redirecting to login');
    next({ name: 'Login', query: { redirect: to.fullPath } });
    return;
  }

  // Check if route requires admin
  if (to.meta.requiresAdmin && !isAdmin) {
    console.log('⛔ Route requires admin, user is not admin');
    next({ name: 'Home' });
    return;
  }

  // Redirect authenticated users away from login/register
  if ((to.name === 'Login' || to.name === 'Register') && isAuthenticated) {
    console.log('✅ User already authenticated, redirecting to home');
    next({ name: 'Home' });
    return;
  }

  // Proceed as normal
  next();
});

export default router;