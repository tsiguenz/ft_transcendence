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
          :messages="messages[currentChatroomId]"
          @leave="switchToDefaultChatroom"
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
      users: [],
      message: '',
      currentChatroomId: 0
    };
  },
  computed: {
    ...mapStores(useSessionStore, useChatStore),
    messages() {
      return this.chatStore.messages;
    }
  },
  methods: {
    async joinChatroom(id) {
      this.currentChatroomId = id;
      ChatService.joinRoom(id);
      ChatService.getRoomMessages(id, this.lastMessageTime(id));
      // const users = await this.getChatroomUsers(id);
    },
    switchToDefaultChatroom() {
      this.currentChatroomId = 0;
    },
    async getChatroomUsers(chatroomId) {
      try {
        const response = await axios.get(
          constants.API_URL + '/chatrooms/' + chatroomId + '/users'
        );
        return response.data;
      } catch (error) {
        alert(error.response.data.message);
      }
    },
    lastMessageTime(chatroomId) {
      // eslint-disable-next-line no-prototype-builtins
      if (
        !this.messages.hasOwnProperty(chatroomId) ||
        this.messages[chatroomId].length < 1
      ) {
        return new Date(null);
      }
      return new Date(this.messages[chatroomId].at(-1).sentAt);
    }
  }
};
</script>
