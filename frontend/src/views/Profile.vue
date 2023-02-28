<template>
  <h1>Profile</h1>
  <p>{{ user.id }}</p>
  <p>{{ user.nickname }}</p>
  <p>{{ user.ladderPoints }}</p>
  <p>{{ user.OAuth }}</p>
  <p>{{ user.twofa }}</p>
  <p>{{ user.createdAt }}</p>
</template>

<script>
import axios from 'axios';
import * as constants from '@/constants.ts';

export default {
  data() {
    return {
      user: {}
    };
  },
  mounted() {
    this.getMe();
  },
  methods: {
    async getMe() {
      try {
        const response = await axios.get(constants.API_URL + '/user/me', {
          headers: {
            Authorization: 'Bearer ' + this.$cookie.getCookie('jwt')
          }
        });
        this.user = response.data;
      } catch (error) {
        // TODO: Handle error
        console.log(error);
      }
    }
  }
};
</script>
