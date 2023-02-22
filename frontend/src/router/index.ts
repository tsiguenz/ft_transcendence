import { createRouter, createWebHistory } from 'vue-router';

const routes = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/Home.vue')
    },
    {
      path: '/auth',
      name: 'Auth',
      component: () => import('../views/Authentification.vue')
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
      path: '/account',
      name: 'Account',
      component: () => import('../views/Account.vue')
    },
    {
      path: '/about',
      name: 'About',
      component: () => import('../views/About.vue')
    }
  ]
});

export default routes;
