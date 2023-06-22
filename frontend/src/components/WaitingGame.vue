<template>
  <v-container>
    <p>{{ message }}</p>
    <span v-if="!isRanked">
      <v-btn class="log" @click="copyGameUrlToClipboard"> Copy game URL </v-btn>
      <p>Invite a friend to play with you:</p>
      <SearchProfile @user-selected="setSelectedUser" />
      <span v-if="selectedUser">
        <p>Friend is: {{ selectedUser }}</p>
        <v-btn @click="inviteUser()">Invite</v-btn>
      </span>
    </span>
  </v-container>
</template>

<script>
import * as constants from '@/constants.ts';
import swall from 'sweetalert';
import SearchProfile from './SearchProfile.vue';
import ChatService from '../services/chat.service';

export default {
  components: {
    SearchProfile
  },
  inject: ['sessionStore'],
  props: {
    isRanked: Boolean,
    gameId: {
      type: String,
      default: ''
    }
  },
  emits: ['create-custom-room'],
  data() {
    return {
      message: '',
      gameUrl: '',
      selectedUser: undefined
    };
  },
  mounted() {
    if (this.isRanked) {
      this.message = 'Waiting for an opponent';
    } else {
      this.message = 'Waiting for your opponent';
      this.gameUrl = constants.GAME_CUSTOM_URL + this.gameId;
    }
  },
  methods: {
    async copyGameUrlToClipboard() {
      try {
        await navigator.clipboard.writeText(this.gameUrl);
        swall({
          title: 'Copied',
          text: 'Game URL copied to clipboard',
          icon: 'success',
          button: 'OK'
        });
      } catch (err) {
        swall({
          title: 'Error',
          text:
            'Failed to copy game URL to clipboard, please copy it manually: ' +
            this.gameUrl,
          icon: 'error',
          button: 'OK'
        });
      }
    },
    setSelectedUser(user) {
      this.selectedUser = user;
    },
    inviteUser() {
      if (this.selectedUser.id === this.sessionStore.userId) {
        swall({
          title: 'Error',
          text: 'You cannot invite yourself',
          icon: 'error',
          button: 'OK'
        });
        this.selectedUser = undefined;
        return;
      }
      const jwt = this.$cookie.getCookie('jwt');
      ChatService.sendGameInvitation(jwt, this.gameUrl, this.selectedUser.id);
      swall({
        title: 'Invitation sent',
        text: 'Your friend will receive a notification',
        icon: 'success',
        button: 'OK'
      });
    }
  }
};
</script>
