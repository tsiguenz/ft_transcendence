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
      twoFactorCode: '',
      errorMessage: '',
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
//        alert('You are now connected !'); Is it useful to make an alert for this ?
        this.$cookie.setCookie('jwt', response.data.access_token);
        this.$router.push('/home');
      } catch (error) {
        // TODO: Handle error with a snackbar
        this.errorMessage = error.response.data.message;
        if (!this.askFor2fa()) {
		swal({
			icon: "error",
			text: error.response.data.message,
		});
        }
        this.twoFactorCode = '';
      }
    },
    askFor2fa() {
      return this.errorMessage === 'Two factor code required';
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
