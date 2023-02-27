import { createApp } from 'vue';
import { createVuetify } from 'vuetify';
import App from './App.vue';
import router from './router';
import 'vuetify/dist/vuetify.min.css';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi';

const app = createApp(App);
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

app.use(vuetify);
app.use(router);
app.mount('#app');
