<template>
  <v-toolbar class="roomName">
      <v-toolbar-title>{{ currentChatroomName() }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <EditChatroomDialog
        v-if="currentUserIsOwner"
        :id="id"
        @delete="(roomId) => $emit('delete', roomId)"
      />
      <v-btn v-if="id && chatStore.hasJoinedRoom" icon="mdi-exit-to-app" @click="leaveRoom"></v-btn>
    </v-toolbar>
  <v-list ref="chat"  class="overflow-y-auto window chating">
    
    <div v-for="item in messages" :key="item.sentAt">
      <p class="text-right ma-2">
        <a
          v-if="item.authorId === currentUserId"
          class="rounded-pill pa-1 bg-blue"
          >{{ item.data }}</a
        ><ProfilePrintAvatar
                  :wdt="25"
                  :hgt="25"
                  :url-avatar="getAvatarUrl(item.authorNickname)"
                ></ProfilePrintAvatar>
      </p>
      <p class="text-left ma-2">
        <a
          v-if="item.authorId !== currentUserId"
          class="rounded-pill pa-1 bg-green"
          >{{ item.authorNickname }}: {{ item.data }}</a
        >
      </p>
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
import axios from 'axios';
import * as constants from '@/constants.ts';
import formatError from '@/utils/lib';
import EditChatroomDialog from '../components/EditChatroomDialog.vue';
import ProfilePrintAvatar from  '../components/ProfilePrintAvatar.vue';

export default {
  components: {
    EditChatroomDialog,
    ProfilePrintAvatar
  },
  props: ['id', 'title', 'messages'],
  emits: ['leave', 'delete'],
  data() {
    return {
      newMessage: '',
      chatroom: []
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
    
  },
  watch: {
    messages: {
      handler() {
        this.$nextTick(() => {
          this.$refs.chat.$el.scrollTop = this.$refs.chat.$el.scrollHeight;
        });
      },
      deep: true
    },
    id: {
      handler() {
        console.log(this.id);
        if (!this.id) {
          return;
        }
        ChatService.joinRoom(this.id);
        ChatService.getRoomMessages(this.id, this.lastMessageTime());
      }
    }
  },
  created() {
    ChatService.setup(this.$cookie.getCookie('jwt'), this.displayError);
  },
  mounted() {
    ChatService.subscribeToMessages((message) => {
      ChatService.storeMessage(message);
    });
    ChatService.subscribeToKick((payload) => {
      this.$emit('leave', payload.chatroomId);
    });
  },
  beforeUnmount() {
    ChatService.disconnect();
  },
  methods: {
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
        text: formatError(payload.message)
      });
    },
    async getAvatarUrl(user){
      console.log( constants.AVATARS_URL + user.avatarPath);
      return constants.AVATARS_URL + user.avatarPath;
    }
  }
};
</script>

<style scoped>


.roomName{
  background-color: var(--medium-purple);

}

.chating{
  /* height:900px; */
  /* overflow-y:auto; */
  max-height: 300px;
}
</style>
