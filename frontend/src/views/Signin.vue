<template>
  <br />
  <v-form>
    <v-text-field
      v-if="!askFor2fa()"
      v-model="nickname"
      class="mb-5"
      label="Nickname"
      variant="outlined"
      autocomplete="username"
      :rules="[rules.nicknameCharacters]"
      required
      @keydown.enter.prevent="signin"
    ></v-text-field>
    <v-text-field
      v-if="!askFor2fa()"
      v-model="password"
      class="mb-5"
      label="Password"
      type="password"
      variant="outlined"
      autocomplete="current-password"
      required
      @keydown.enter.prevent="signin"
    ></v-text-field>
    <v-text-field
      v-if="askFor2fa()"
      v-model="twoFactorCode"
      class="mb-5"
      label="2fa code"
      variant="outlined"
      @keydown.enter.prevent="signin"
    ></v-text-field>
    <v-btn @click="signin">Sign In</v-btn>
  </v-form>
  <br />
  <div v-if="!askFor2fa()">
    <v-btn @click="signin42">Sign in with 42</v-btn>
  </div>
</template>

<script>
import axios from 'axios';
import * as constants from '@/constants.ts';
import { mapStores } from 'pinia';
import { useSessionStore } from '@/store/session';

export default {
  data() {
    return {
      nickname: '',
      password: '',
      twoFactorCode: '',
      errorMessage: '',
      auth42: constants.API_URL + '/auth/42',
      rules: {
        nicknameCharacters: (v) =>
          /^[a-zA-Z0-9-]{0,8}$/.test(v) ||
          "Must contain only alphanumeric, '-' and be less than 8 characters long"
      }
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
        this.sessionStore.signin(this.nickname);
        alert('You are now connected !');
        this.$cookie.setCookie('jwt', response.data.access_token);
        this.$router.push('/home');
      } catch (error) {
        // TODO: Handle error with a snackbar
        this.errorMessage = error.response.data.message;
        if (!this.askFor2fa()) {
          alert(error.response.data.message);
        }
        this.twoFactorCode = '';
      }
    },
    async signin42() {
      window.location.href = this.auth42;
    },
    askFor2fa() {
      return this.errorMessage === 'Two factor code required';
    }
  }
};
</script>
