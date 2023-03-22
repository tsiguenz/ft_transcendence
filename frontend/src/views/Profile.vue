<template>
  <h1>Profile infos</h1>
  <p>Id: {{ user.id }}</p>
  <p>Nickname: {{ user.nickname }}</p>
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

  <!-- TODO: 
  When edit profile set the 2fa, print the qrcode and ask for a code to prevent
  bad usage.
  -->
  <v-btn v-if="twoFaIsEnable()" @click="generate2faQrcode"
    >generate new 2fa qrcode</v-btn
  >
  <img v-if="qrcode" :src="qrcode" alt="qrcode" width="200" height="200" />
  <!-- TODO: add delete account and logout logic -->
</template>

<script>
import axios from 'axios';
import * as constants from '@/constants.ts';

export default {
  data() {
    return {
      user: {},
      newNickname: '',
      newTwoFactorEnable: false,
      qrcode: ''
    };
  },
  mounted() {
    this.getProfile();
  },
  methods: {
    async getProfile() {
      try {
        const response = await axios.get(constants.API_URL + '/profile');
        this.user = response.data;
        this.newNickname = this.user.nickname;
        this.newTwoFactorEnable = this.user.twoFactorEnable;
      } catch (error) {
        // TODO: Handle error
        this.$router.push('/logout');
      }
    },
    async editProfile() {
      try {
        const response = await axios.put(
          constants.API_URL + '/profile',
          {
            nickname: this.newNickname,
            twoFactorEnable: this.newTwoFactorEnable
          }
        );
        alert(response.data.message);
        this.$router.push('/home');
      } catch (error) {
        alert(error.response.data.message);
      }
    },
    async generate2faQrcode() {
      try {
        const response = await axios.get(
          constants.API_URL + '/2fa/generate-qrcode');
        this.qrcode = response.data.qrcode;
      } catch (error) {
        alert(error.response.data.message);
      }
    },
    twoFaIsEnable() {
      return this.user.twoFactorEnable;
    }
  }
};
</script>
