import { createApp } from 'vue';
import { createVuetify } from 'vuetify';
import App from './App.vue';
import router from './router';
import 'vuetify/dist/vuetify.min.css';
import '@mdi/font/css/materialdesignicons.css';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { VueCookieNext } from 'vue-cookie-next';
import axios from 'axios';
import '../assets/style.scss';
import * as constants from './constants';
import VueJwtDecode from 'vue-jwt-decode';

const app = createApp(App);
const pinia = createPinia();
const vuetify = createVuetify({
  theme: { defaultTheme: 'dark' },
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi
    }
  }
});

pinia.use(piniaPluginPersistedstate);
app.use(VueCookieNext);
VueCookieNext.config({ expire: '7d' });
app.use(vuetify);
app.use(pinia);
app.use(router);
app.mount('#app');

axios.interceptors.request.use(
  (config) => {
    const jwt = VueCookieNext.getCookie('jwt');
    if (jwt) {
      config.headers.Authorization = `Bearer ${jwt}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const isUnauthorized = error.response.status === 401;
    const isRefreshUrl =
      error.config.url === constants.API_URL + '/auth/refresh';
    if (!isUnauthorized || isRefreshUrl) return Promise.reject(error);
    try {
      const jwt = VueCookieNext.getCookie('jwt');
      const expirationTimestamp = VueJwtDecode.decode(jwt).exp;
      const now = Math.floor(Date.now() / 1000);
      if (now < expirationTimestamp) {
        window.location.href = '/logout';
        return Promise.reject(error);
      }
      // refresh the expired access_token
      const refreshToken = VueCookieNext.getCookie('refresh_token');
      const response = await axios.post(
        constants.API_URL + '/auth/refresh',
        {},
        { headers: { Authorization: `Bearer ${refreshToken}` } }
      );
      VueCookieNext.setCookie('jwt', response.data.access_token);
      VueCookieNext.setCookie('refresh_token', response.data.refresh_token);
      error.config.headers['Authorization'] =
        'Bearer ' + response.data.access_token;
      // fix socket disconnected when refresh page and jwt is expired
      // reload page to restart the sockets with the new token
      // its bad but idk how to do it better
      window.location.reload();
      return axios.request(error.config);
    } catch (e) {
      window.location.href = '/logout';
      return Promise.reject(error);
    }
  }
);
