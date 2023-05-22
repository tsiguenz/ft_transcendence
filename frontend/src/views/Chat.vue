<template>
  <v-container fluid>
    <v-row justify="space-between" align="start">
      <v-col cols="3">
        <Chatrooms :id="currentChatroomId" @join="joinChatroom" />
      </v-col>
      <v-col cols="6">
        <Chat
          :id="currentChatroomId"
          title="Chat"
          :messages="messages"
          @leave="leaveRoom"
          @delete="leaveRoom"
        />
      </v-col>
      <v-col cols="3">
        <ChatroomUsers :id="currentChatroomId" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import BlockUserService from '../services/blockUser.service';
import { mapStores } from 'pinia';
import { useSessionStore } from '@/store/session';
import { useChatStore } from '@/store/chat';
import Chat from '../components/Chat.vue';
import Chatrooms from '../components/Chatrooms.vue';
import ChatroomUsers from '../components/ChatroomUsers.vue';

export default {
  components: {
    Chat,
    Chatrooms,
    ChatroomUsers
  },
  data() {
    return {
    };
  },
  computed: {
    ...mapStores(useSessionStore, useChatStore),
    messages() {
      return this.chatStore.activeRoomMessages;
    },
    currentChatroomId() {
      return this.chatStore.activeChatroom;
    }
  },
  created() {
    BlockUserService.getBlockedUsers(this.sessionStore.nickname);
  },
  methods: {
    async joinChatroom(id) {
      this.chatStore.activeChatroom = id;
    },
    leaveRoom(id) {
      if (id == this.currentChatroomId) {
        this.chatStore.switchToDefaultChatroom();
      }
      this.chatStore.removeRoom(id);
    }
  }
};
</script>
