<template>
<v-dialog v-if="!isLog()" width="100%">
	<template v-slot:activator="{ props }">
		<v-btn v-bind="props">login</v-btn>
	</template>
	<v-container>
		<v-row align="center" justify="center">
			<v-col cols="5">
				<v-card height="100%" width="100%">
					<v-card-title class="justify-center">LOG IN</v-card-title>
					<v-divider></v-divider>
					<v-card-text>
						<v-form>
							<v-text-field
								autofocus
								v-model="nickname"
								class="mb-5"
								label="Nickname"
								variant="outlined"
								autocomplete="username"
								required
								@keydown.enter.prevent="signin"
							></v-text-field>
							<v-text-field
								v-model="password"
								class="mb-5"
								label="Password"
								type="password"
								variant="outlined"
								autocomplete="current-password"
								required
								@keydown.enter.prevent="signin"
							></v-text-field>
							<v-row justify="space-between">
								<v-btn @click="signin">Sign In</v-btn>
								<v-btn @click="signin42">Sign in with 42</v-btn>
							</v-row>
<!--							<v-row justify="space-between">
								<v-btn @click="signup">Sign up</v-btn>
							</v-row> -->
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
import swal from 'sweetalert2';
import formatError from '@/utils/lib';

export default {
  data() {
    return {
      nickname: '',
      password: '',
      twoFactorCode: '',
      auth42: `https://api.intra.42.fr/oauth/authorize?client_id=${
        import.meta.env.VITE_APP42_ID
      }&redirect_uri=${
        import.meta.env.VITE_CALLBACK_URL
      }&response_type=code&scope=public`
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
        if (response.data.message === 'Two factor code required') {
          this.$router.push(`/2fa/verify?id=${response.data.id}`);
          return;
        }
        this.sessionStore.signin(this.nickname);
        this.$cookie.setCookie('jwt', response.data.access_token);
        this.$router.push('/profile');
      } catch (error) {
				swal.fire('Hehe, this is a test');
//			alert(formatError(error.response.data.message));
        // TODO: Handle error with a snackbar
//        swal({
//          icon: 'error',
//          text: formatError(error.response.data.message),
//					buttons: {
//						confirm: {
//							text: "Try again"
//						}
//					},
//					focusConfirm: true,
//        });
      }
    },
    signin42() {
      window.location.href = this.auth42;
    },
		signup() {
			this.$router.push('/signup');
		},
		isLog() {
			return this.sessionStore.loggedIn;
		}
  }
};
</script>
