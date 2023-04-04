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
import * as constants from '@/constants.ts';
import { mapStores } from 'pinia';
import { useSessionStore } from '@/store/session';
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
        constants.FRONT_URL
      }/42/callback&response_type=code&scope=public`
    };
  },
  computed: {
    ...mapStores(useSessionStore)
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
        this.sessionStore.signin(this.nickname);
        this.$cookie.setCookie('jwt', response.data.access_token);
        this.$router.push('/home');
      } catch (error) {
        // TODO: Handle error with a snackbar
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

<style>
.swal-overlay {
  background-color: rgba(255, 255, 255, 0.5);
}

.swal-modal {
  background-color: rgba(0, 0, 0, 1);
  border: 3px solid white;
}

.swal-button {
  background-color: rgba(255, 255, 255, 0);
  border: 1px solid white;
}

.swal-text {
  color: rgba(225, 225, 225, 1);
}
</style>
