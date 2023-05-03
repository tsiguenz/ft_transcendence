<template>
		<v-btn v-if="!isLog()" class="log">Sign In
<v-dialog v-model="dialog" activator="parent">
	<v-container>
		<v-row align="center" justify="center">
				<v-card class="card" height="100%" width="400px">
					<v-card-title>
					<div class="d-flex justify-space-between mb-6">
							Sign In
						<v-btn class="card" @click="dialog = false"><v-icon icon="mdi-close"></v-icon></v-btn>
					</div>
					</v-card-title>
					<v-divider></v-divider>
					<v-card-text>
					<div v-for="message in errorMessage" class="d-block mb-5">
						<v-icon icon="mdi-alert-box"></v-icon>
						{{ message }}
					</div>
						<v-form>
							<v-text-field
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
								label="Password"
								type="password"
								variant="outlined"
								autocomplete="current-password"
								required
								@keydown.enter.prevent="signin"
							></v-text-field>
						</v-form>
					</v-card-text>
						<v-card-actions>
									<v-btn class="btn" @click="signin">Sign In</v-btn>
							<v-spacer />
									<v-btn class="btn" @click="signin42">Sign in with 42</v-btn>
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
import formatError from '@/utils/lib';

export default {
  data() {
    return {
			errorMessage: [],
			dialog: false,
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
        this.$router.push('/home');
      } catch (error) {
			this.errorMessage = [];
				if (typeof error.response.data.message === 'string')
					this.errorMessage.push(error.response.data.message);
				else
					this.errorMessage = error.response.data.message;
      }
    },
    signin42() {
      window.location.href = this.auth42;
    },
		isLog() {
			return this.sessionStore.loggedIn;
		}
  }
};
</script>

<style lang="scss" scoped>
.card{
  background: var(--dark-alt);
}
.btn{
    background-image: linear-gradient(to right, var(--light) 0%, var(--dark-purple) 51%, var(--light) 100%);
		width: 180px;
    bottom: 0;
    text-align: center;
    text-transform: uppercase;
    transition: 0.5s;
    background-size: 200% auto;
    border-radius: 5px;
    display: flex;

}

</style>
