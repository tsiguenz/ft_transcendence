<template>
  <br />
  <v-form>
    <v-text-field
      v-model='nickname'
      label='Nickname'
      variant='outlined'
      autocomplete="username"
      required
      :rules='[rules.nicknameCharacters]'
    ></v-text-field>
    <v-text-field
      v-model='password'
      label='Password'
      type='password'
      variant='outlined'
      autocomplete="new-password"
      required
    ></v-text-field>
    <v-text-field
      v-model='passwordVerify'
      label='Verify password'
      type='password'
      variant='outlined'
      required
      :rules='[rules.passwordCheck]'
      @keydown.enter.prevent='signup'
    ></v-text-field>
    <v-text-field
      v-model="passwordVerify"
      label="Verify password"
      type="password"
      variant="outlined"
      autocomplete="new-password"
      required
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
	nicknameCharacters: (v) => /^[a-zA-Z0-9-]{0,8}$/.test(v) || 'Nickname must contain only alphanumeric characters and the \'-\' character',
	passwordCheck: (v) => v === this.password || 'Passwords do not match !',
      }
    };
  },
  computed: {
    ...mapStores(useSessionStore)
  },
  methods: {
    async signup() {
      // TODO: clean the input to protect injection
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
  },
}
</script>
