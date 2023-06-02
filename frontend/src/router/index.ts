import { createRouter, createWebHistory } from 'vue-router';
import { useSessionStore } from '@/store/session';
import * as constants from '@/constants';

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
      path: '/friends',
      name: 'Friends',
      component: () => import('../views/Friends.vue')
    },
    {
      path: '/profile/me',
      name: 'ProfileMe',
      component: () => import('../views/ProfileMe.vue'),
      props: true
    },
    {
      path: '/profile/:nickname',
      name: 'ProfileNickname',
      component: () => import('../views/Profile.vue'),
      props: true
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('../views/Settings.vue')
    },
    {
      path: '/logout',
      name: 'Logout',
      component: () => import('../views/Logout.vue')
    },
    {
      path: '/42/callback',
      name: '42',
      component: () => import('../views/Callback.vue')
    },
    {
      path: '/2fa/verify',
      name: '2fa',
      component: () => import('../views/TwoFactorVerify.vue')
    }
  ]
});

router.beforeEach(async (to) => {
  const sessionStore = useSessionStore();
  if (to.path == '/') {
    router.push('/home');
    return;
  }
  // redirect to signin if not logged in and try to access authenticated routes
  if (
    !sessionStore.loggedIn &&
    !constants.UNAUTHENTICATED_ROUTES.includes(to.path)
  ) {
    router.push('/signin');
    return;
  }
  // redirect to home if logged in and try to access unauthenticated routes
  if (
    sessionStore.loggedIn &&
    constants.UNAUTHENTICATED_ROUTES_WITHOUT_HOME.includes(to.path)
  ) {
    router.push('/home');
    return;
  }
});

export default router;
