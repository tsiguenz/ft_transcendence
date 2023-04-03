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
      required
      :rules="[rules.passwordCheck]"
      @keydown.enter.prevent="signup"
    ></v-text-field>
    <v-btn :disabled="!isFormValid" @click="signup">Sign Up</v-btn>
  </v-form>
</template>

<script>
import axios from 'axios';
import * as constants from '@/constants.ts';
import { mapStores } from 'pinia';
import { useSessionStore } from '@/store/session';
import swal from 'sweetalert';

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
    ...mapStores(useSessionStore)
  },
  methods: {
    async signup() {
      if (this.password !== this.passwordVerify) {
	swal({
		icon: 'error',
		text: 'Passwords do not match !',
	});
//        alert('Passwords do not match !');
        return;
      }
      if (!this.isFormValid) {
	swal({
		icon: 'error',
		text: 'Invalid character or length in nickname'
	});
//        alert('Invalid character in nickname');
        return;
      }
      try {
        const response = await axios.post(constants.API_URL + '/auth/signup', {
          nickname: this.nickname,
          password: this.password
        });
//        alert('Account created !'); Is it useful to make an alert for this ?
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

<style>
	.swal-overlay {
		background-color: rgba(255, 255, 255, 0.5);
	}

	.swal-modal{
		background-color: rgba(0, 0, 0, 1);
		border: 3px solid white;
	}

	.swal-button{
		background-color: rgba(255, 255, 255, 0);
		border: 1px solid white;
	}

	.swal-text{
		color: rgba(225, 225, 225, 1);
	}
</style>
