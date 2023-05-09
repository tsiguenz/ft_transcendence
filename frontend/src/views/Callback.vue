<template></template>

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
      twoFactorCode: ''
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
    // TODO: code duplication from Signin.vue
    async signin42() {
      if (!this.authorizationCode) {
        swal({
          icon: 'error',
          text: 'You need to be connected to 42 to access this page'
        });
        this.$router.push('/signin');
        return;
      }
      try {
        const response = await axios.post(constants.API_URL + '/auth/42', {
          authorization: this.authorizationCode
        });
        if (response.data.message === 'Two factor code required') {
          this.$router.push(`/2fa/verify?id=${response.data.id}`);
          return;
        }
        const jwt = response.data.access_token;
        this.$cookie.setCookie('jwt', jwt);
        this.sessionStore.signin(VueJwtDecode.decode(jwt).sub, response.data.nickname);
        this.$root.connectAndSubscribeStatusSocket();
        this.$router.push('/home');
      } catch (error) {
        swal({ icon: 'error', text: formatError(error.response.data.message) });
        this.$router.push('/signin');
      }
    }
  }
};
</script>
