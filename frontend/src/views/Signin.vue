<template>
  <br />
  <v-form>
    <v-text-field
      v-model="nickname"
      label="Nickname"
      variant="outlined"
      required
    ></v-text-field>
    <v-text-field
      v-model="password"
      label="Password"
      type="password"
      variant="outlined"
      required
      @keydown.enter.prevent="signin"
    ></v-text-field>
    <v-btn @click="signin">Sign In</v-btn>
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
      password: ''
    };
  },
  computed: {
    ...mapStores(useSessionStore),
  },
  methods: {
    async signin() {
      // TODO: clean the input to protect injection
      try {
        const response = await axios.post(constants.API_URL + '/auth/signin', {
          nickname: this.nickname,
          password: this.password
        });
        this.sessionStore.signin(this.nickname);
        alert('You are now connected !');
        this.$cookie.setCookie('jwt', response.data.access_token);
        this.$router.push('/home');
      } catch (error) {
        // TODO: Handle error with a snackbar
        alert(error.response.data.message);
      }
    }
  }
};
</script>
