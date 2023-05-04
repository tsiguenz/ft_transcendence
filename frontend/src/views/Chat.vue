<template>
  <v-container fluid>
    <v-row justify="space-between" align="start">
      <v-col cols="3">
        <Chatrooms
          :id="currentChatroomId"
          @join="joinChatroom"
        />
      </v-col>
      <v-col cols="6">
        <Chat
          :id="currentChatroomId"
          title="Chat"
          :messages="messages"
          @leave="leaveRoom"
        />
      </v-col>
      <v-col cols="3">
        <ChatroomUsers :id="currentChatroomId" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios';
import * as constants from '@/constants';
import ChatService from '../services/chat.service';
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
      // currentChatroomId: 0,
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
  methods: {
    async joinChatroom(id) {
      this.chatStore.activeChatroom = id;
    },
    leaveRoom(id) {
      this.chatStore.removeRoom(id);
      this.chatStore.switchToDefaultChatroom();
    },
  }
};
</script>
