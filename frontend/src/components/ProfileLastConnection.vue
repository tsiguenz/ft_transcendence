<template>
	<v-row class="justify-center"><h4 class="font">{{ this.lastCo }}</h4></v-row>
	<v-row class="justify-center"><p>Last connection</p></v-row>
</template>

<script>
import axios from 'axios';
import * as constants from '@/constants.ts';
import swal from 'sweetalert';
import formatError from '@/utils/lib';
import { mapStores } from 'pinia';
import { useSessionStore } from '@/store/session';

export default {
  data() {
    return {
      user: {},
			lastCo: '',
    };
  },
  computed: {
    ...mapStores(useSessionStore)
  },
  async mounted() {
    await this.getProfile();
		setInterval(() => {
			this.getProfile();
		}, 1000);
  },
  methods: {
    async getProfile() {
      try {
        const response = await axios.get(
          constants.API_URL + `/users/${this.sessionStore.nickname}/profile`
        );
        this.user = response.data;
				const lastCoUTC = new Date(this.user.lastConnection).getTime();
				const nowUTC = new Date().getTime();
				this.lastCo = new Date(nowUTC - lastCoUTC).toISOString().slice(11, 19);
      } catch (error) {
        swal({
          icon: 'error',
          text: formatError(error.response.data.message)
        });
        this.$router.push('/logout');
      }
    }
  }
};
</script>

<style>
.font {
  font-family: 'Poppins', serif;
}
</style>
