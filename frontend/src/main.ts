import { createApp } from 'vue';
import { createVuetify } from 'vuetify';
import App from './App.vue';
import router from './router';
import 'vuetify/dist/vuetify.min.css';
import '@mdi/font/css/materialdesignicons.css'
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { VueCookieNext } from 'vue-cookie-next';
import axios from 'axios';
import '../assets/style.scss';

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

axios.interceptors.request.use(config => {
  const jwt = VueCookieNext.getCookie('jwt');
  if (jwt) {
      config.headers.Authorization = `Bearer ${jwt}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
);
