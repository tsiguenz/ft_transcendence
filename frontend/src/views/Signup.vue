<template>
  <br />
  <v-form v-model="isFormValid">
    <v-text-field
      v-model="nickname"
      class="mb-5"
      label="Nickname"
      variant="outlined"
      autocomplete="username"
      required
      :rules="[rules.nicknameCharacters]"
      @keydown.enter.prevent="signup"
    ></v-text-field>
    <v-text-field
      v-model="password"
      class="mb-5"
      label="Password"
      type="password"
      variant="outlined"
      autocomplete="new-password"
      required
      @keydown.enter.prevent="signup"
    ></v-text-field>
    <v-text-field
      v-model="passwordVerify"
      class="mb-5"
      label="Verify password"
      type="password"
      variant="outlined"
      autocomplete="new-password"
      required
      :rules="[rules.passwordCheck]"
      @keydown.enter.prevent="signup"
    ></v-text-field>
    <v-btn :disabled="!isFormValid" @click="signup">Sign Up</v-btn>
  </v-form>
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
      passwordVerify: '',
      isFormValid: false,
      rules: {
        nicknameCharacters: (v) =>
          /^[a-zA-Z0-9-]{1,8}$/.test(v) ||
          "Must contain only alphanumeric, '-' and have a length between 1 and 8",
        passwordCheck: (v) => v === this.password || 'Passwords do not match !'
      }
    };
  },
  computed: {
    ...mapStores(useSessionStore),
    ...mapStores(useConnectedUsersStore)
  },
  methods: {
    async signup() {
      if (this.password !== this.passwordVerify) {
        swal({
          icon: 'error',
          text: 'Passwords do not match !'
        });
        return;
      }
      if (!this.isFormValid) {
        swal({
          icon: 'error',
          text: 'Invalid character or length in nickname'
        });
        return;
      }
      try {
        const response = await axios.post(constants.API_URL + '/auth/signup', {
          nickname: this.nickname,
          password: this.password
        });
        const tokens = response.data;
        this.$cookie.setCookie('jwt', tokens.access_token);
        this.$cookie.setCookie('refresh_token', tokens.refresh_token);
        this.sessionStore.signin(
          VueJwtDecode.decode(tokens.access_token).sub,
          this.nickname
        );
        this.$root.connectAndSubscribeStatusSocket();
        this.$router.push('/home');
      } catch (error) {
        swal({
          icon: 'error',
          text: formatError(error.response.data.message)
        });
      }
    }
  }
};
</script>
