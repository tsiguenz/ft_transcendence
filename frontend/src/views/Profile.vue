<template>
  <h1>Profile</h1>
  <p>Id: {{ user.id }}</p>
  <p>Nickname: {{ user.nickname }}</p>
  <p>Ladder points: {{ user.ladderPoints }}</p>
  <p>2fa enable: {{ user.twoFactorEnable }}</p>
  <p>Created at: {{ user.createdAt }}</p>
  <p>Avatar: {{ user.avatar }}</p>
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
    this.getProfile();
  },
  methods: {
    async getProfile() {
      try {
        const jwt = this.$cookie.getCookie('jwt');
        const response = await axios.get(constants.API_URL + '/profile', {
          headers: {
            Authorization: 'Bearer ' + jwt
          }
        });
        this.user = response.data;
      } catch (error) {
        // TODO: Handle error
        this.$router.push('/logout');
      }
    }
  }
};
</script>
