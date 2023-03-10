import { createRouter, createWebHistory } from 'vue-router';
import { VueCookieNext } from 'vue-cookie-next';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/home',
      name: 'Home',
      component: () => import('../views/Home.vue')
    },
    {
      path: '/chat',
      name: 'Chat',
      component: () => import('../views/Chat.vue')
    },
    {
      path: '/signin',
      name: 'Signin',
      component: () => import('../views/Signin.vue')
    },
    {
      path: '/signup',
      name: 'Signup',
      component: () => import('../views/Signup.vue')
    },
    {
      path: '/game',
      name: 'Game',
      component: () => import('../views/Game.vue')
    },
    {
      path: '/leaderboard',
      name: 'Leaderboard',
      component: () => import('../views/Leaderboard.vue')
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('../views/Profile.vue')
    },
    {
      path: '/logout',
      name: 'Logout',
      component: () => import('../views/Logout.vue')
    }
  ]
});

router.beforeEach(async (to) => {
  if (to.path == '/') {
    router.push('/home');
    return;
  }
  const UNAUTHENTICATED_ROUTES = ['/signin', '/signup', '/home'];
  // TODO: When change between two pages who redirect to /signin page, the page is not reloaded
  if (
    !VueCookieNext.isCookieAvailable('jwt') &&
    !(UNAUTHENTICATED_ROUTES.includes(to.path))
  ) {
    router.push('/signin');
    return;
  }
});

export default router;
