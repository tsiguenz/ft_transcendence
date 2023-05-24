<template>
  <br />
  <v-form>
    <v-text-field
      v-model="twoFactorCode"
      class="mb-5"
      label="2fa code"
      variant="outlined"
      @keydown.enter.prevent="verify"
    ></v-text-field>
    <v-btn class="log" @click="verify">Validate two factor code</v-btn>
  </v-form>
</template>

<script>
import axios from 'axios';
import * as constants from '@/constants.ts';
import { mapStores } from 'pinia';
import { useSessionStore } from '@/store/session';
import swal from 'sweetalert';
import formatError from '@/utils/lib';
import VueJwtDecode from 'vue-jwt-decode';

export default {
  data() {
    return {
      twoFactorCode: ''
    };
  },
  computed: {
    ...mapStores(useSessionStore)
  },
  methods: {
    async verify() {
      try {
        const response = await axios.post(constants.API_URL + '/2fa/verify', {
          code: this.twoFactorCode,
          id: this.$route.query.id
        });
        if (response.data.message === 'Invalid two factor code') {
          swal({
            icon: 'error',
            text: 'Invalid two factor code'
          });
          this.$router.push('/signin');
          return;
        }
        const data = response.data;
        this.sessionStore.signin(
          VueJwtDecode.decode(data.access_token).sub,
          response.data.nickname
        );
        this.$cookie.setCookie('jwt', data.access_token);
        this.$cookie.setCookie('refresh_token', data.refresh_token);
        this.$root.connectAndSubscribeStatusSocket();
        this.$router.push('/home');
      } catch (error) {
        swal({
          icon: 'error',
          text: formatError(error.response.data.message)
        });
        this.$router.push('/signin');
      }
    }
  }
};
</script>
