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
      variant="outlined"
      required
    ></v-text-field>
    <v-text-field
      v-model="passwordVerify"
      label="Verify password"
      variant="outlined"
      required
    ></v-text-field>
    <v-btn @click="signup">Sign Up</v-btn>
  </v-form>
</template>

<script>
import axios from 'axios';
import * as constants from '@/constants.ts';

export default {
  data() {
    return {
      nickname: '',
      password: '',
      passwordVerify: ''
    };
  },
  methods: {
    async signup() {
      // TODO: clean the input to protect injection
      // TODO: do something with jwt
      if (this.password !== this.passwordVerify) {
        alert('Passwords do not match !');
        return;
      }
      try {
        const response = await axios.post(constants.API_URL + '/auth/signup', {
          nickname: this.nickname,
          password: this.password
        });
        console.log(response.data.access_token);
      } catch (error) {
        // TODO: Handle error (it return an error in the console)
        alert(error.response.data.message);
      }
    }
  }
};
</script>
