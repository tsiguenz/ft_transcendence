<template>
  <div class="full">
  <h1>Profile infos</h1>
  <p>Nickname: {{ user.nickname }}</p>
  <p>2fa enable: {{ user.twoFactorEnable }}</p>
  <p>Created at: {{ user.createdAt }}</p>
  <img :src="avatarPath" alt="avatar" width="100" height="100" />
  <p>Avatar path: {{ avatarPath }}</p>

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

    <input type="file" name="avatar" @change="onFileChange" />

    <br />

    <v-btn v-if="!qrcode" :disabled="!isFormValid" @click="dispatchEditProfile">
      submit
    </v-btn>
  </v-form>

  <img v-if="qrcode" :src="qrcode" alt="qrcode" width="200" height="200" />
  <v-form v-if="qrcode">
    <v-text-field
      v-model="twoFactorCode"
      label="Code"
      required
      @keydown.enter.prevent="editProfile"
    ></v-text-field>
    <v-btn v-if="qrcode" @click="editProfile">Validate code</v-btn>
  </v-form>

  <v-btn v-if="!qrcode" to="/logout">Logout</v-btn>
  <v-btn v-if="!qrcode" @click="alertDeleteAccount">Delete Account</v-btn>
</div>
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
      newNickname: '',
      newTwoFactorEnable: false,
      newAvatar: '',
      avatarPath: '',
      twoFactorCode: '',
      qrcode: '',
      isFormValid: false,
      rules: {
        nicknameCharacters: (v) =>
          /^[a-zA-Z0-9-]{1,8}$/.test(v) ||
          this.user.nickname === v ||
          "Must contain only alphanumeric, '-' and have a length between 1 and 8"
      }
    };
  },
  computed: {
    ...mapStores(useSessionStore)
  },
  async mounted() {
    await this.getProfile();
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
        this.avatarPath = constants.AVATARS_URL + this.user.avatarPath;
      } catch (error) {
        swal({
          icon: 'error',
          text: formatError(error.response.data.message)
        });
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
        this.sessionStore.nickname = this.newNickname;
        if (this.newAvatar) await this.uploadAvatar(jwt);
        swal({
          icon: 'https://cdn3.emoji.gg/emojis/5573-okcat.png',
          text: formatError(response.data.message)
        });
        this.$router.push('/home');
      } catch (error) {
        swal({
          icon: 'error',
          text: formatError(error.response.data.message)
        });
      }
    },
    async dispatchEditProfile() {
      if (!this.isFormValid) {
        swal({
          icon: 'error',
          text: 'Invalid character or length in nickname'
        });
        return;
      }
      if (this.newTwoFactorEnable && !this.user.twoFactorEnable) {
        await this.generate2faQrcode();
      } else {
        await this.editProfile();
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
        swal({
          icon: 'error',
          text: formatError(error.response.data.message)
        });
      }
    },
    async deleteAccount() {
      const jwt = this.$cookie.getCookie('jwt');
      try {
        await axios.delete(constants.API_URL + '/users/' + this.user.nickname, {
          headers: {
            Authorization: 'Bearer ' + jwt
          }
        });
        this.$router.push('/logout');
      } catch (error) {
        swal({
          icon: 'error',
          text: formatError(error.response.data.message)
        });
      }
    },
    alertDeleteAccount() {
      swal({
        icon: 'warning',
        text: 'You are deleting your account, do you want to continue?',
        buttons: {
          confirm: "I'll lost all my datas",
          cancel: "Don't delete my account"
        }
      }).then((confirm) => {
        if (confirm) {
          swal('Account deleted');
          this.deleteAccount();
        }
      });
    },
    onFileChange(e) {
      const avatar = e.target.files[0];
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      const fileSizeMb = avatar.size / 1024 ** 2;
      if (!allowedTypes.includes(avatar.type) || fileSizeMb > 2) {
        swal({
          icon: 'error',
          text: 'Invalid file type (png / jpeg / jpg) or size (max 2MB)'
        });
        e.target.value = '';
      }
      this.newAvatar = avatar;
    },
    async uploadAvatar(jwt) {
      const formData = new FormData();
      formData.append('file', this.newAvatar);
      await axios.post(constants.API_URL + '/profile/avatar', formData, {
        headers: {
          Authorization: 'Bearer ' + jwt,
          'Content-Type': 'multipart/form-data'
        }
      });
    }
  }
};
</script>
