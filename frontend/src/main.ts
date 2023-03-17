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
import axios from 'axios';

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


axios.interceptors.request.use(config => {
  const token = this.$cookie.getCookie('jwt');
  if (!token) { return; }
  config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

pinia.use(piniaPluginPersistedstate);
app.use(VueCookieNext);
VueCookieNext.config({ expire: '7d' });
app.use(vuetify);
app.use(pinia);
app.use(router);
app.mount('#app');
