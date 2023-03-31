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
    <v-btn @click="verify">Validate two factor code</v-btn>
  </v-form>
</template>

<script>
import axios from 'axios';
import * as constants from '@/constants.ts';
import { mapStores } from 'pinia';
import { useSessionStore } from '@/store/session';

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
          alert('Invalid two factor code');
          this.$router.push('/signin');
          return;
        }
        alert('You are now connected !');
        this.sessionStore.signin(response.data.nickname);
        this.$cookie.setCookie('jwt', response.data.access_token);
        this.$router.push('/home');
      } catch (error) {
        alert(error.response.data.message);
        this.$router.push('/signin');
      }
    }
  }
};
</script>
