<template>
  <v-toolbar class="roomName">
    <v-toolbar-title>{{ currentChatroomName() }}</v-toolbar-title>
    <v-spacer></v-spacer>
    <EditChatroomDialog
      v-if="currentUserIsOwner"
      :id="id"
      @delete="(roomId) => $emit('delete', roomId)"
    />
    <v-btn
      v-if="id && chatStore.hasJoinedRoom"
      icon="mdi-exit-to-app"
      @click="leaveRoom"
    ></v-btn>
  </v-toolbar>
  <v-list ref="chat" class="overflow-y-auto window chating">
    <div v-for="item in messages" :key="item.sentAt">
      <div v-if="item.authorId === currentUserId" class="author">
        <p class="name">{{ item.authorNickname }}</p>
        <span class="text-right ma-2 msg">
          <p class="bubble pa-1 bg-blue msg-content">{{ item.data }}</p>
          <ProfilePrintAvatar
            :wdt="40"
            :hgt="40"
            :url-avatar="getAvatarUrlComputed(item.authorNickname)"
          ></ProfilePrintAvatar>
        </span>
      </div>
      <div v-if="item.authorId !== currentUserId" class="other">
        <p class="nameOther">{{ item.authorNickname }}</p>
        <span class="text-left ma-2 msgOther">
          <ProfilePrintAvatar
            :wdt="40"
            :hgt="40"
            :url-avatar="getAvatarUrlComputed(item.authorNickname)"
          ></ProfilePrintAvatar>
          <p class="bubble pa-1 bg-green msg-content">{{ item.data }}</p>
        </span>
      </div>
    </div>
  </v-list>
  <v-text-field
    v-model="newMessage"
    label="Message"
    @keyup.enter="sendMessage"
  ></v-text-field>
</template>

<script>
import ChatService from '../services/chat.service';
import { mapStores } from 'pinia';
import { useSessionStore } from '@/store/session';
import { useChatStore } from '@/store/chat';
import swal from 'sweetalert';
import * as lib from '@/utils/lib';
import axios from 'axios';
import * as constants from '@/constants.ts';
import EditChatroomDialog from '../components/EditChatroomDialog.vue';
import ProfilePrintAvatar from '../components/ProfilePrintAvatar.vue';

export default {
  components: {
    EditChatroomDialog,
    ProfilePrintAvatar
  },
  props: ['id', 'messages'],
  emits: ['leave', 'delete'],
  data() {
    return {
      newMessage: '',
      chatroom: [],
      avatarUrls: {}
    };
  },
  computed: {
    ...mapStores(useSessionStore, useChatStore),
    currentUserId() {
      return this.sessionStore.userId;
    },
    currentUserIsOwner() {
      const currentUser = this.chatStore.users.find(
        (x) => x.id === this.currentUserId
      );
      if (!currentUser || currentUser.role !== 'OWNER') {
        return false;
      }
      return true;
    },
    getAvatarUrlComputed() {
      return (authorNickname) => {
        return this.avatarUrls[authorNickname];
      };
    }
  },
  watch: {
    messages: {
      handler(newMessages) {
        this.$nextTick(() => {
          this.$refs.chat.$el.scrollTop = this.$refs.chat.$el.scrollHeight;
        });
        const authorNicknames = Array.from(
          new Set(newMessages.map((message) => message.authorNickname))
        );
        authorNicknames.forEach((nickname) => {
          if (!this.avatarUrls[nickname]) {
            this.fetchAvatarUrl(nickname);
          }
        });
      },
      deep: true,
      immediate: true
    },
    id: {
      handler() {
        if (!this.id) {
          return;
        }
        this.connectRoom();
      }
    }
  },
  // created() {
  //   ChatService.setup(this.$cookie.getCookie('jwt'), this.displayError);
  // },
  mounted() {
    // this.connectRoom();
    // ChatService.subscribeToMessages((message) => {
    //   ChatService.storeMessage(message);
    // });
    // ChatService.subscribeToKick((payload) => {
    //   this.$emit('leave', payload.chatroomId);
    // });
    const authorNicknames = Array.from(
      new Set(this.messages.map((message) => message.authorNickname))
    );
    authorNicknames.forEach((nickname) => this.fetchAvatarUrl(nickname));
  },
  methods: {
    connectRoom() {
      ChatService.connectRoom(this.id);
      ChatService.getRoomMessages(this.id, this.lastMessageTime());
    },
    sendMessage() {
      if (this.newMessage == '') {
        return;
      }
      ChatService.sendMessage({
        chatroomId: this.id,
        message: this.newMessage
      });
      this.newMessage = '';
    },
    leaveRoom() {
      this.$emit('leave', this.id);
      ChatService.leaveRoom(this.id);
    },
    lastMessageTime() {
      // eslint-disable-next-line no-prototype-builtins
      if (!this.messages || this.messages.length < 1) {
        return new Date(null);
      }
      return new Date(this.messages.at(-1).sentAt);
    },
    currentChatroomName() {
      if (!this.id) {
        return '';
      }
      const chatroom = this.chatStore.chatrooms.find((x) => x.id === this.id);
      if (!chatroom) {
        return '';
      }
      return chatroom.name;
    },
    displayError(payload) {
      swal({
        icon: 'error',
        text: lib.formatError(payload.message)
      });
    },
    async fetchAvatarUrl(userName) {
      const response = await axios.get(constants.API_URL + '/users/');
      const user = response.data.find((user) => user.nickname === userName);
      const avatarPath = constants.AVATARS_URL + user.avatarPath;
      this.avatarUrls[userName] = avatarPath;
    }
  }
};
</script>

<style scoped>
.roomName {
  background-color: var(--medium-purple);
}
.chating {
  max-height: 500px;
}

.msg {
  display: flex;
  justify-content: end;
  gap: 10px;
}
.msgOther {
  display: flex;
  gap: 10px;
}

.bubble {
  border-radius: 5px;
}

.name {
  text-align: end;
  padding-right: 10px;
  font-size: 10px;
}

.nameOther {
  padding-left: 10px;
  font-size: 10px;
}

.msg-content {
  max-width: 300px;
  word-wrap: break-word;
  text-align: left;
}
</style>
