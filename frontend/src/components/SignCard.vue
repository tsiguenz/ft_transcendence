<template>
  <v-btn v-if="!isLog()" class="log">
    <div v-if="toSignin">Sign In</div>
    <div v-else>Sign up</div>
    <v-dialog persistent v-model="dialog" activator="parent">
      <v-container>
        <v-row align="center" justify="center">
          <v-card class="card" height="100%" width="400px">
            <v-card-title>
              <div class="d-flex justify-space-between">
                <div v-if="toSignin">Sign In</div>
                <div v-else>Sign up</div>
                <v-btn class="card" @click="reset"
                  ><v-icon icon="mdi-close"></v-icon
                ></v-btn>
              </div>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
              <div v-for="message in errorMessage" class="d-block mb-5">
                <v-icon icon="mdi-alert-box"></v-icon>
                {{ message }}
              </div>
              <v-form ref="form" v-if="toSignin">
                <v-text-field
                  v-model="nickname"
                  autocomplete="username"
                  class="mb-5"
                  label="Nickname"
                  required
                  @keydown.enter.prevent="signin"
                ></v-text-field>
                <v-text-field
                  v-model="password"
                  autocomplete="current-password"
                  label="Password"
                  type="password"
                  required
                  @keydown.enter.prevent="signin"
                ></v-text-field>
              </v-form>
              <v-form ref="form" v-else v-model="isFormValid">
                <v-text-field
                  v-model="nickname"
                  autocomplete="username"
                  class="mb-5"
                  label="Nickname"
                  required
                  :rules="[rules.nicknameCharacters]"
                  @keydown.enter.prevent="signup"
                ></v-text-field>
                <v-text-field
                  v-model="password"
                  autocomplete="new-password"
                  class="mb-5"
                  label="Password"
                  type="password"
                  required
                  @keydown.enter.prevent="signup"
                ></v-text-field>
                <v-text-field
                  v-model="passwordVerify"
                  autocomplete="new-password"
                  class="mb-5"
                  label="Verify password"
                  type="password"
                  required
                  :rules="[rules.passwordCheck]"
                  @keydown.enter.prevent="signup"
                ></v-text-field>
              </v-form>
            </v-card-text>
            <v-card-actions v-if="toSignin" class="justify-center">
              <v-btn class="btn mb-5 pa-5" @click="signin">Sign In</v-btn>
            </v-card-actions>
            <v-divider></v-divider>
            <v-card-actions v-if="toSignin" class="justify-center">
              <v-btn class="btn ma-5 pa-5" @click="signin42"
                >Sign in with 42</v-btn
              >
            </v-card-actions>
            <v-card-actions v-else class="justify-center">
              <v-btn class="btn" :disabled="!isFormValid" @click="signup"
                >Sign Up</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-row>
      </v-container>
    </v-dialog>
  </v-btn>
</template>

<script>
import axios from 'axios';
import * as constants from '@/constants.ts';
import { mapStores } from 'pinia';
import { useSessionStore } from '@/store/session';
import VueJwtDecode from 'vue-jwt-decode';

export default {
  props: {
    toSignin: false
  },
  data() {
    return {
      nickname: '',
      password: '',
      passwordVerify: '',
      twoFactorCode: '',
      errorMessage: [],
      dialog: false,
      auth42: `https://api.intra.42.fr/oauth/authorize?client_id=${
        import.meta.env.VITE_APP42_ID
      }&redirect_uri=${
        import.meta.env.VITE_CALLBACK_URL
      }&response_type=code&scope=public`,
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
    ...mapStores(useSessionStore)
  },
  methods: {
    async signin() {
      this.errorMessage = [];
      try {
        const response = await axios.post(constants.API_URL + '/auth/signin', {
          nickname: this.nickname,
          password: this.password,
          twoFactorCode: this.twoFactorCode
        });
        if (response.data.message === 'Two factor code required') {
          this.$router.push(`/2fa/verify?id=${response.data.id}`);
          this.dialog = false;
          return;
        }
        const tokens = response.data;
        this.sessionStore.signin(
          VueJwtDecode.decode(tokens.access_token).sub,
          this.nickname
        );
        this.$cookie.setCookie('jwt', tokens.access_token);
        this.$cookie.setCookie('refresh_token', tokens.refresh_token);
        this.$root.connectAndSubscribeStatusSocket();
        this.$router.push('/home');
      } catch (error) {
        this.setErrorMessage(error.response.data.message);
      }
    },
    reset() {
      this.$refs.form.reset();
      this.dialog = false;
    },
    signin42() {
      window.location.href = this.auth42;
    },
    async signup() {
      this.errorMessage = [];
      if (this.password !== this.passwordVerify) {
        this.setErrorMessage('Passwords do not match !');
        return;
      }
      try {
        const response = await axios.post(constants.API_URL + '/auth/signup', {
          nickname: this.nickname,
          password: this.password
        });
        const tokens = response.data;
        this.sessionStore.signin(
          VueJwtDecode.decode(tokens.access_token).sub,
          this.nickname
        );
        this.$cookie.setCookie('jwt', tokens.access_token);
        this.$cookie.setCookie('refresh_token', tokens.refresh_token);
        this.$root.connectAndSubscribeStatusSocket();
        this.$router.push('/home');
      } catch (error) {
        this.setErrorMessage(error.response.data.message);
      }
    },
    isLog() {
      return this.sessionStore.loggedIn;
    },
    setErrorMessage(error) {
      if (typeof error === 'string') this.errorMessage.push(error);
      else this.errorMessage = error;
    }
  }
};
</script>

<style lang="scss" scoped>
.card {
  background: var(--dark-purple);
  border-radius: 30px;
}
.btn {
  background-image: linear-gradient(
    to right,
    var(--light) 0%,
    var(--dark-purple) 51%,
    var(--light) 100%
  );
  width: 250px;
  bottom: 0;
  text-align: center;
  text-transform: uppercase;
  transition: 0.5s;
  background-size: 200% auto;
  border-radius: 5px;
  display: flex;
}
</style>
