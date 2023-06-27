<template>
  <v-container>
    <v-col cols="12">
      <v-row justify="center">
        <span v-if="!userId">
          <v-sheet
            v-if="!isRanked && urlIsCopy"
            width="90%"
            class="sheet pa-5 my-5"
          >
            <p class="font">Game URL copied, give it to your opponent</p>
          </v-sheet>
        </span>
        <v-sheet
          v-if="isRanked || urlIsCopy || userId || userIsInvited"
          width="90%"
          class="[userIs ? transparent : sheet] pa-5 my-5"
        >
          <h2 class="font">{{ message }}</h2>
          <v-progress-linear color="white" indeterminate />
        </v-sheet>
      </v-row>
      <v-row justify="center" width="100%">
        <span v-if="!isRanked && !userId && !userIsInvited">
          <v-btn
            v-if="!isRanked && !urlIsCopy"
            class="btn pa-5 my-5"
            width="100%"
            @click="copyGameUrlToClipboard"
          >
            Copy game URL
          </v-btn>
          <SearchProfile @user-selected="setSelectedUser" />
          <span v-if="selectedUser">
            <v-btn class="btn" width="100%" @click="inviteUser()"
              >Invite {{ selectedUser.nickname }}
            </v-btn>
          </span>
        </span>
        <v-btn
          v-if="!userId"
          class="btn pa-5 my-5"
          width="100%"
          @click="goToChooseMode()"
          >Back to game menu</v-btn
        >
      </v-row>
    </v-col>
  </v-container>
</template>

<script>
import * as constants from '@/constants.ts';
import swall from 'sweetalert';
import SearchProfile from './SearchProfile.vue';
import ChatService from '../services/chat.service';
import * as lib from '@/utils/lib';

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
    },
    userId: {
      type: String,
      required: true
    }
  },
  emits: ['create-custom-room'],
  data() {
    return {
      message: '',
      gameUrl: '',
      urlIsCopy: false,
      selectedUser: undefined,
      userIsInvited: false
    };
  },
  created() {
    if (!this.userId) return;
    ChatService.setup(this.$cookie.getCookie('jwt'), lib.displayError);
  },
  mounted() {
    if (this.isRanked) {
      this.message = 'Waiting for an opponent';
    } else {
      this.message = 'Waiting for your opponent';
      this.gameUrl = constants.GAME_CUSTOM_URL + this.gameId;
      if (this.userId) {
        ChatService.sendGameInvitation(this.gameUrl, this.userId);
      } else {
        ChatService.setup(this.$cookie.getCookie('jwt'), lib.displayError);
      }
    }
  },
  beforeUnmount() {
    if (!this.userId) return;
    ChatService.disconnect();
  },
  methods: {
    async copyGameUrlToClipboard() {
      try {
        this.urlIsCopy = true;
        await navigator.clipboard.writeText(this.gameUrl);
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
    goToChooseMode() {
      const gameView = this.isRanked ? this.$parent : this.$parent.$parent;
      gameView.setStatusToInChooseMode();
      gameView.leaveRoom();
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
      ChatService.sendGameInvitation(this.gameUrl, this.selectedUser.id);
      swall({
        title: 'Invitation sent',
        text: 'Your friend will receive a notification',
        icon: 'success',
        button: 'OK'
      });
      this.userIsInvited = true;
    }
  }
};
</script>

<style>
.font {
  font-family: 'Poppins', serif;
  text-align: center;
}
.sheet {
  background-color: var(--dark-purple);
  border-style: solid;
  border-radius: 2px;
  box-shadow: 5px 5px 5px var(--light-purple) !important;
  border-color: var(--light-purple) !important;
}
.transparent {
  background-color: transparent;
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
