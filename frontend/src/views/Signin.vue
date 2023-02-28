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
    ></v-text-field>
    <v-btn @click="signin">Sign In</v-btn>
  </v-form>
</template>

<script>
import axios from 'axios';
import * as constants from '@/constants.ts';
import router from '@/router';

export default {
  data() {
    return {
      nickname: '',
      password: ''
    };
  },
  methods: {
    async signin() {
      // TODO: clean the input to protect injection
      // TODO: do something with jwt
      try {
        const response = await axios.post(constants.API_URL + '/auth/signin', {
          nickname: this.nickname,
          password: this.password
        });
        alert('You are now connected !');
        this.$cookie.setCookie('jwt', response.data.access_token);
        router.push('/');
      } catch (error) {
        // TODO: Handle error (it return an error in the console)
        alert(error.response.data.message);
      }
    }
  }
};
</script>
