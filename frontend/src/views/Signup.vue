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
      required
      :rules="[rules.passwordCheck]"
      @keydown.enter.prevent="signup"
    ></v-text-field>
    <v-btn @click="signup">Sign Up</v-btn>
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
      nickname: '',
      password: '',
      passwordVerify: '',
      rules: {
        nicknameCharacters: (v) =>
          /^[a-zA-Z0-9-]{0,8}$/.test(v) ||
          "Must contain only alphanumeric, '-' and be less than 8 characters long",
        passwordCheck: (v) => v === this.password || 'Passwords do not match !'
      }
    };
  },
  computed: {
    ...mapStores(useSessionStore)
  },
  methods: {
    async signup() {
      if (this.password !== this.passwordVerify) {
        alert('Passwords do not match !');
        return;
      }
      if (!/^[a-zA-Z0-9-]{0,8}$/.test(this.nickname)) {
        alert('Invalid character in nickname');
        return;
      }
      try {
        const response = await axios.post(constants.API_URL + '/auth/signup', {
          nickname: this.nickname,
          password: this.password
        });
        alert('Account created !');
        this.$cookie.setCookie('jwt', response.data.access_token);
        this.sessionStore.signin(this.nickname);
        this.$router.push('/home');
      } catch (error) {
        // TODO: Handle error with a snackbar
        alert(error.response.data.message);
      }
    }
  }
};
</script>
