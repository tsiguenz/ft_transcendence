<template>
  <h1>Profile infos</h1>
  <p>Id: {{ user.id }}</p>
  <p>Nickname: {{ user.nickname }}</p>
  <p>Ladder points: {{ user.ladderPoints }}</p>
  <p>2fa enable: {{ user.twoFactorEnable }}</p>
  <p>Created at: {{ user.createdAt }}</p>
  <p>Avatar: {{ user.avatar }}</p>

  <!-- TODO: make it beautiful -->
  <br />
  <h1>Edit profile</h1>
  <v-form>
    <v-text-field
      v-model="newNickname"
      label="Nickname"
      required
    ></v-text-field>

    <input
      v-model="newTwoFactorEnable"
      type="checkbox"
      label="2fa"
      checked
      required
    />
    <label for="newTwoFactorEnable">2fa</label>

    <br />

    <v-btn @click="editProfile"> submit </v-btn>
  </v-form>
  <!-- TODO: add delete account and logout -->
</template>

<script>
import axios from 'axios';
import * as constants from '@/constants.ts';

export default {
  data() {
    return {
      user: {},
      newNickname: '',
      newTwoFactorEnable: false
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
        this.newNickname = this.user.nickname;
        this.newTwoFactorEnable = this.user.twoFactorEnable;
      } catch (error) {
        // TODO: Handle error
        this.$router.push('/logout');
      }
    },
    async editProfile() {
      const jwt = this.$cookie.getCookie('jwt');
      try {
        const response = await axios.put(
          constants.API_URL + '/profile',
          {
            nickname: this.newNickname,
            twoFactorEnable: this.newTwoFactorEnable
          },
          {
            headers: {
              Authorization: 'Bearer ' + jwt
            }
          }
        );
        alert(response.data.message);
        this.$router.push('/home');
      } catch (error) {
        alert(error.response.data.message);
      }
    }
  }
};
</script>
