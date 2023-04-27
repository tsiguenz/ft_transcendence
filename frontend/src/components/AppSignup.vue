<template>
<v-dialog v-if="!isLog()" width="100%">
	<template v-slot:activator="{ props }">
		<v-btn v-bind="props">sign up</v-btn>
	</template>
	<v-container>
		<v-row align="center" justify="center">
			<v-col cols="5">
				<v-card height="100%" width="100%">
					<v-card-title class="justify-center">SIGN UP</v-card-title>
					<v-divider></v-divider>
					<v-card-text>
						<v-form v-model="isFormValid">
						  <v-text-field
								autofocus
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
					</v-card-text>
				</v-card>
			</v-col>
		</v-row>
	</v-container>
</v-dialog>
</template>

<script>
import axios from 'axios';
import * as constants from '@/constants.ts';
import { mapStores } from 'pinia';
import { useSessionStore } from '@/store/session';
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
    ...mapStores(useSessionStore)
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
        this.$cookie.setCookie('jwt', response.data.access_token);
        this.sessionStore.signin(this.nickname);
        this.$router.push('/home');
      } catch (error) {
        swal({
          icon: 'error',
          text: formatError(error.response.data.message)
        });
        // TODO: Handle error with a snackbar
      }
		},
		isLog() {
			return this.sessionStore.loggedIn;
    }
  }
};
</script>

<style>
.swal-overlay {
  background-color: rgba(255, 255, 255, 0.5);
}

.swal-modal {
  background-color: rgba(0, 0, 0, 1);
  border: 3px solid white;
}

.swal-button {
  background-color: rgba(255, 255, 255, 0);
  border: 1px solid white;
}

.swal-text {
  color: rgba(225, 225, 225, 1);
}
</style>
