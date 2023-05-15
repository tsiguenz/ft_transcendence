<template>
  <v-form v-if="printForm">
    <v-text-field
      v-model="nickname"
      class="mb-5"
      label="Nickname"
      variant="outlined"
      autocomplete="username"
      required
      @keydown.enter.prevent="signin42"
    ></v-text-field>
    <v-btn @click="signin42">Create account</v-btn>
  </v-form>
</template>

<script>
import axios from 'axios';
import * as constants from '@/constants.ts';
import { mapStores } from 'pinia';
import { useSessionStore } from '@/store/session';
import { useConnectedUsersStore } from '@/store/connectedUsers';
import swal from 'sweetalert';
import formatError from '@/utils/lib';
import VueJwtDecode from 'vue-jwt-decode';

export default {
  data() {
    return {
      authorizationCode: this.$route.query.code,
      twoFactorCode: '',
      printForm: false,
      nickname: '',
      accessToken42: ''
    };
  },
  computed: {
    ...mapStores(useSessionStore),
    ...mapStores(useConnectedUsersStore)
  },
  mounted() {
    this.signin42();
  },
  methods: {
    async signin42() {
      if (!this.authorizationCode) {
        swal({
          icon: 'error',
          text: 'You need to be connected to 42 to access this page'
        });
        this.$router.push('/home');
        return;
      }
      if (this.nickname === '' && this.printForm === true) {
        swal({ icon: 'error', text: 'Nickname is required' });
        return;
      }
      try {
        const response = await axios.post(constants.API_URL + '/auth/42', {
          authorization: this.authorizationCode,
          nickname: this.nickname,
          access_token42: this.accessToken42
        });
        if (response.data.message === 'Two factor code required') {
          this.$router.push(`/2fa/verify?id=${response.data.id}`);
          return;
        }
        if (response.data.message == 'Nickname required') {
          this.printForm = true;
          this.accessToken42 = response.data.access_token42;
          return;
        }
        const tokens = response.data;
        this.$cookie.setCookie('jwt', tokens.access_token);
        this.$cookie.setCookie('refresh_token', tokens.refresh_token);
        this.sessionStore.signin(
          VueJwtDecode.decode(tokens.access_token).sub,
          response.data.nickname
        );
        this.$root.connectAndSubscribeStatusSocket();
        this.$router.push('/home');
      } catch (error) {
        swal({ icon: 'error', text: formatError(error.response.data.message) });
      }
    }
  }
};
</script>
