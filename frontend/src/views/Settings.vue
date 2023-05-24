<template>
  <v-container flex>
    <v-row justify="center"><h1 class="font mb-10">Settings</h1></v-row>
		<v-row class="mb-10">
		<v-col cols="4">
    <v-sheet class="sheet pa-5 mt-5">
      <h2 class="font">Change nickname</h2>
      You are {{ this.user.nickname }}
      <v-form class="ma-5" v-model="isValidForm">
        <v-text-field
          v-model="newNickname"
          :rules="[rules.nicknameCharacters]"
          required
          @keydown.enter.prevent="editNickname"
        ></v-text-field>
      </v-form>
      <v-btn class="log" width="100%" :disabled="!isValidForm" @click="editNickname">
        submit
      </v-btn>
    </v-sheet>
		</v-col>
		<v-col cols="4">
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
      <v-file-input
        class="my-5"
        type="file"
        name="avatar"
        @change="onFileChange"
      />
      <v-btn class="log" width="100%" :disabled="!isValidAvatar" @click="editTFA">
        submit
      </v-btn>
    </v-sheet>
		</v-col>
		<v-col cols="4">
    <v-sheet class="sheet pa-5 mt-5">
      <h2 class="font">Manage two-factor authentification</h2>
			<v-row class="ma-5 justify-center">
      <v-btn
        :disabled="newTwoFactorEnable && !qrcode"
        class="log"
        @click="generate2faQrcode"
        >Enable</v-btn
      >
			</v-row>
			<v-row class="ma-5 justify-center">
      <v-btn
        :disabled="!newTwoFactorEnable && !qrcode"
        class="log"
        @click="generate2faQrcode"
        >Disable</v-btn
      >
			</v-row>
      <v-dialog v-model="dialog" persistent>
        <v-row align="center" justify="center">
          <v-sheet class="sheet pa-10" height="100%" width="500">
                <v-row justify="end"><v-btn class="close" @click="dialog = false"
                  ><v-icon icon="mdi-close"></v-icon
                ></v-btn></v-row>
            <v-row class="justify-center ma-5 mb-10">
              Scan this QR Code with Google Authenticator
            </v-row>
            <v-row class="justify-center ma-5 mb-10">
              <img :src="qrcode" alt="qrcode" width="200" height="200" />
            </v-row>
            <v-form v-if="qrcode">
              <v-row class="justify-center ma-3">
                <v-text-field
                  v-model="twoFactorCode"
                  label="Enter the generated code"
                  required
                  @keydown.enter.prevent="editTFA"
                ></v-text-field>
              </v-row>
              <v-row class="justify-center ma-3">
                <v-btn v-if="qrcode" class="btn" @click="editTFA"
                  >Validate code</v-btn
                >
              </v-row>
            </v-form>
          </v-sheet>
        </v-row>
      </v-dialog>
    </v-sheet>
		</v-col>
		</v-row>

    <v-row class="ma-5 justify-center"><v-btn class="log" width="100%" @click="alertDeleteAccount">Delete Account</v-btn></v-row>
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
      isValidForm: false,
      isValidAvatar: false,
      userIsMounted: false,
      dialog: false,
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
      } catch (error) {
        swal({
          icon: 'error',
          text: formatError(error.response.data.message)
        });
      }
        this.getProfile();
    },
    async editNickname() {
      if (!this.isValidForm) {
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
      } catch (error) {
        swal({
          icon: 'error',
          text: formatError(error.response.data.message)
        });
      }
        this.getProfile();
    },
    async editTFA() {
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
      } catch (error) {
        swal({
          icon: 'error',
          text: formatError(error.response.data.message)
        });
      }
      this.getProfile();
      this.qrcode = '';
      this.dialog = false;
    },
    async generate2faQrcode() {
      this.dialog = true;
      this.newTwoFactorEnable = !this.newTwoFactorEnable;
      if (!this.newTwoFactorEnable) {
        this.dialog = false;
        this.editTFA();
        return;
      }
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
      if (!avatar) {
        return;
      }
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      const fileSizeMb = avatar.size / 1024 ** 2;
      if (
        !allowedTypes.includes(avatar.type) ||
        fileSizeMb > 2 ||
        fileSizeMb <= 0
      ) {
        swal({
          icon: 'error',
          text: 'Invalid file type (png / jpeg / jpg) or size (max 2MB)'
        });
        e.target.value = '';
      } else this.isValidAvatar = true;
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
.close {
  background: var(--dark-purple);
}
.sheet {
  background: var(--dark-purple);
  border-radius: 30px;
  border: 3px solid var(--light);
	text-align: center;
	height: 100%
}
.disable-events {
	pointer-events: none
}
</style>
