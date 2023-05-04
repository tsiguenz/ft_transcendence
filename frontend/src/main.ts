import { createApp } from 'vue';
import { createVuetify } from 'vuetify';
import App from './App.vue';
import router from './router';
import 'vuetify/dist/vuetify.min.css';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { VueCookieNext } from 'vue-cookie-next';
import '../assets/style.scss';
import axios from 'axios';
import * as constants from './constants';

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

axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (
      error.response.status === 401 &&
      error.config.url !== constants.API_URL + '/auth/refresh'
    ) {
      const refreshToken = VueCookieNext.getCookie('refresh_token');
      try {
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
      }
    }
    return error;
  }
);
