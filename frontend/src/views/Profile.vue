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
  <v-form v-if="!qrcode" v-model="isFormValid">
    <v-text-field
      v-model="newNickname"
      label="Nickname"
      :rules="[rules.nicknameCharacters]"
      required
      @keydown.enter.prevent="dispatchEditProfile"
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

    <v-btn :disabled="!isFormValid" v-if="!qrcode" @click="dispatchEditProfile"> submit </v-btn>
  </v-form>

  <img v-if="qrcode" :src="qrcode" alt="qrcode" width="200" height="200" />
  <v-form v-if="qrcode">
    <v-text-field
      v-model="twoFactorCode"
      label="2fa code"
      required
      @keydown.enter.prevent="editProfile"
    ></v-text-field>
    <v-btn v-if="qrcode" @click="editProfile"
      >Validate edit profile with 2fa code</v-btn
    >
  </v-form>

  <!-- TODO: add delete account and logout logic -->
  <v-btn to="/logout">Logout</v-btn>
  <v-btn @click="deleteAccount">Delete Account</v-btn>
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
      twoFactorCode: '',
      qrcode: '',
			isFormValid: false,
      rules: {
        nicknameCharacters: (v) =>
          /^[a-zA-Z0-9-]{0,8}$/.test(v) && v !== '' ||
          "Must contain only alphanumeric, '-' and have a length between 1 and 8"
      }
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
      try {
        const jwt = this.$cookie.getCookie('jwt');
        const response = await axios.put(
          constants.API_URL + '/profile',
          {
            nickname: this.newNickname,
            twoFactorEnable: this.newTwoFactorEnable,
            twoFactorCode: this.twoFactorCode
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
    },
    async dispatchEditProfile() {
      if (!/^[a-zA-Z0-9-]{0,8}$/.test(this.newNickname)) {
        alert('Invalid character in nickname');
        return;
      }
      if (this.newTwoFactorEnable && !this.user.twoFactorEnable) {
        this.generate2faQrcode();
      } else {
        this.editProfile();
      }
    },
    async generate2faQrcode() {
      const jwt = this.$cookie.getCookie('jwt');
      try {
        const response = await axios.get(
          constants.API_URL + '/2fa/generate-qrcode',
          {
            headers: {
              Authorization: 'Bearer ' + jwt
            }
          }
        );
        this.qrcode = response.data.qrcode;
      } catch (error) {
        alert(error.response.data.message);
      }
    },
    async deleteAccount() {
      const jwt = this.$cookie.getCookie('jwt');
      try {
        const response = await axios.delete(
          constants.API_URL + '/users/' + this.user.nickname,
          {
            headers: {
              Authorization: 'Bearer ' + jwt
            }
          }
        );
        alert('Account is delete');
        this.$router.push('/logout');
      } catch (error) {
        alert(error.response.data.message);
      }
    }
  }
};
</script>
