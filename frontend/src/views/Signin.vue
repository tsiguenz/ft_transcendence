<template>
  <br />
  <v-form>
    <v-text-field
      v-model="nickname"
      class="mb-5"
      label="Nickname"
      variant="outlined"
      autocomplete="username"
      required
      @keydown.enter.prevent="signin"
    ></v-text-field>
    <v-text-field
      v-model="password"
      class="mb-5"
      label="Password"
      type="password"
      variant="outlined"
      autocomplete="current-password"
      required
      @keydown.enter.prevent="signin"
    ></v-text-field>
    <v-btn @click="signin">Sign In</v-btn>
  </v-form>
  <br />
  <div>
    <v-btn @click="signin42">Sign in with 42</v-btn>
  </div>
</template>

<script>
import axios from 'axios';
import VueJwtDecode from 'vue-jwt-decode';
import * as constants from '@/constants.ts';
import { mapStores } from 'pinia';
import { useSessionStore } from '@/store/session';
import { useConnectedUsersStore } from '@/store/connectedUsers';
import swal from 'sweetalert';
import formatError from '@/utils/lib';

export default {
  data() {
    return {
      nickname: '',
      password: '',
      twoFactorCode: '',
      auth42: `https://api.intra.42.fr/oauth/authorize?client_id=${
        import.meta.env.VITE_APP42_ID
      }&redirect_uri=${
        import.meta.env.VITE_CALLBACK_URL
      }&response_type=code&scope=public`
    };
  },
  computed: {
    ...mapStores(useSessionStore),
    ...mapStores(useConnectedUsersStore)
  },
  methods: {
    async signin() {
      try {
        const response = await axios.post(constants.API_URL + '/auth/signin', {
          nickname: this.nickname,
          password: this.password,
          twoFactorCode: this.twoFactorCode
        });
        if (response.data.message === 'Two factor code required') {
          this.$router.push(`/2fa/verify?id=${response.data.id}`);
          return;
        }

        const tokens = response.data;
        this.sessionStore.signin(VueJwtDecode.decode(tokens.access_token).sub, this.nickname);
        this.$cookie.setCookie('jwt', tokens.access_token);
        this.$cookie.setCookie('refresh_token', tokens.refresh_token);
        this.$root.connectAndSubscribeStatusSocket();
        this.$router.push('/home');
      } catch (error) {
        swal({
          icon: 'error',
          text: formatError(error.response.data.message)
        });
      }
    },
    signin42() {
      window.location.href = this.auth42;
    }
  }
};
</script>
