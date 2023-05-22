<template>
  <v-container flex>
    <v-row justify="center"><h1 class="font mb-10">Settings</h1></v-row>
    <v-sheet class="sheet pa-5 mt-5">
      <h2 class="font">Change nickname</h2>
			You are {{ this.user.nickname }}
      <v-form class="ma-5" v-model="isFormValid">
        <v-text-field
          v-model="newNickname"
          :rules="[rules.nicknameCharacters]"
          required
          @keydown.enter.prevent="editNickname"
        ></v-text-field>
      </v-form>
      <v-btn
				class="btn"
        :disabled="!isFormValid"
        @click="editNickname"
      >
        submit
      </v-btn>
    </v-sheet>
    <v-sheet class="sheet pa-5 mt-5">
      <h2 class="font">Change avatar</h2>
		<v-row justify="center">
    <ProfilePrintAvatar
				class="my-3"
        v-if="userIsMounted"
        :wdt="150"
        :hgt="150"
        :urlAvatar="this.avatarPath"
      />
			</v-row>
      <v-file-input class="my-5" type="file" name="avatar" @change="onFileChange" />
      <v-btn
				class="btn"
        :disabled="!isValidAvatar"
        @click="editAvatar"
      >
        submit
      </v-btn>
    </v-sheet>








		<v-sheet class="sheet">
		<v-btn v-if="!newTwoFactorEnable">Enabled TFA</v-btn>
		<v-btn v-if="newTwoFactorEnable">Disabled TFA</v-btn>
    <v-form v-if="!qrcode">
      <input
        v-model="newTwoFactorEnable"
        type="checkbox"
        label="2fa"
        checked
        required
      />
      <label for="newTwoFactorEnable">2fa</label>
      <br />
      <v-btn
        v-if="!qrcode"
        :disabled="!isFormValid"
        @click="dispatchEditProfile"
      >
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
		</v-sheet>

    <v-btn v-if="!qrcode" to="/logout">Logout</v-btn>
    <v-btn v-if="!qrcode" @click="alertDeleteAccount">Delete Account</v-btn>
  </v-container>
</template>

<script>
import axios from 'axios';
import * as constants from '@/constants.ts';
import swal from 'sweetalert';
import formatError from '@/utils/lib';
import { mapStores } from 'pinia';
import { useSessionStore } from '@/store/session';
import ProfilePrintAvatar from '../components/ProfilePrintAvatar.vue';
import ProfileLadderPoints from '../components/ProfileLadderPoints.vue';
import ProfileAchievements from '../components/ProfileAchievements.vue';
import ProfileHistoryGames from '../components/ProfileHistoryGames.vue';
import ProfileLastConnection from '../components/ProfileLastConnection.vue';

export default {
  components: {
    ProfilePrintAvatar,
    ProfileLadderPoints,
    ProfileAchievements,
    ProfileHistoryGames,
    ProfileLastConnection
  },
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
			isValidAvatar: false,
      userIsMounted: false,
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
        const response = await axios.get(
          constants.API_URL + `/users/${this.sessionStore.nickname}/profile`
        );
        this.user = response.data;
        this.newNickname = this.user.nickname;
        this.newTwoFactorEnable = this.user.twoFactorEnable;
        this.avatarPath = constants.AVATARS_URL + this.user.avatarPath;
        this.userIsMounted = true;
      } catch (error) {
        swal({
          icon: 'error',
          text: formatError(error.response.data.message)
        });
        this.$router.push('/logout');
      }
    },
    async editAvatar() {
      try {
        const jwt = this.$cookie.getCookie('jwt');
        const response = await axios.put(
          constants.API_URL + `/users/${this.sessionStore.nickname}/profile`,
          {
            nickname: this.newNickname,
            twoFactorEnable: this.newTwoFactorEnable,
            twoFactorCode: this.twoFactorCode
          }
        );
        if (this.newAvatar) await this.uploadAvatar(jwt);
				this.getProfile();
      } catch (error) {
        swal({
          icon: 'error',
          text: formatError(error.response.data.message)
        });
      }
    },
    async editNickname() {
      if (!this.isFormValid) {
        swal({
          icon: 'error',
          text: 'Invalid character or length in nickname'
        });
        return;
      }
      try {
        const jwt = this.$cookie.getCookie('jwt');
        const response = await axios.put(
          constants.API_URL + `/users/${this.sessionStore.nickname}/profile`,
          {
            nickname: this.newNickname,
            twoFactorEnable: this.newTwoFactorEnable,
            twoFactorCode: this.twoFactorCode
          }
        );
        this.sessionStore.nickname = this.newNickname;
				this.getProfile();
      } catch (error) {
        swal({
          icon: 'error',
          text: formatError(error.response.data.message)
        });
      }
    },
    async editProfile() {
      try {
        const jwt = this.$cookie.getCookie('jwt');
        const response = await axios.put(
          constants.API_URL + `/users/${this.sessionStore.nickname}/profile`,
          {
            nickname: this.newNickname,
            twoFactorEnable: this.newTwoFactorEnable,
            twoFactorCode: this.twoFactorCode
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
      try {
        const response = await axios.get(
          constants.API_URL + '/2fa/generate-qrcode'
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
			if (!avatar) { return ;}
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      const fileSizeMb = avatar.size / 1024 ** 2;
      if (!allowedTypes.includes(avatar.type) || fileSizeMb > 2 || fileSizeMb <= 0 ){
        swal({
          icon: 'error',
          text: 'Invalid file type (png / jpeg / jpg) or size (max 2MB)'
        });
        e.target.value = '';
      }
			else
				this.isValidAvatar = true;
      this.newAvatar = avatar;
    },
    async uploadAvatar(jwt) {
      const formData = new FormData();
      formData.append('file', this.newAvatar);
      await axios.post(
        constants.API_URL + `/users/${this.sessionStore.nickname}/avatar`,
        formData,
        {
          headers: {
            Authorization: 'Bearer ' + jwt,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
    }
  }
};
</script>

<style>
.font {
  font-family: 'Poppins', serif;
}
.sheet {
  background: var(--dark-purple);
  border-radius: 30px;
  border: 3px solid var(--light);
}
.btn {
  background-image: linear-gradient(
    to right,
    var(--light) 0%,
    var(--dark-purple) 51%,
    var(--light) 100%
  );
  width: 250px;
  bottom: 0;
  text-align: center;
  text-transform: uppercase;
  transition: 0.5s;
  background-size: 200% auto;
  border-radius: 5px;
  display: flex;
}
</style>
