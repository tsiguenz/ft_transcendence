<template>
  <h1>Chat</h1>
  <v-layout>
    <v-navigation-drawer>
      <div v-for="chatroom in chatrooms">
        <v-btn variant='text' v-if="chatroom.id != this.currentChatroomId" v-on:click="joinChatroom(chatroom.id)">Join</v-btn>
        {{ chatroom.name }}
      </div>
      <v-form @submit.prevent>
        <v-text-field
          v-model="newChatroomName"
          label="New chatroom"
          v-on:keyup.enter="newChatroom"
        ></v-text-field>
      </v-form>
    </v-navigation-drawer>
    <v-main>
      <v-sheet width="300" class="mx-auto">
        <div v-for="message in messages[this.currentChatroomId]">
          From [{{ message.author }}]: {{ message.data }}
        </div>
        <v-form @submit.prevent>
          <v-text-field
            v-model="message"
            label="Message"
            v-on:keyup.enter="sendMessage"
          ></v-text-field>
        </v-form>
      </v-sheet>
    </v-main>
  </v-layout>
</template>

<script>
import axios from 'axios';
import * as constants from '@/constants';
import ChatService from '../services/chat.service';
import { mapStores } from 'pinia';
import { useSessionStore } from '@/store/session';

export default {
  data() {
    return {
      users: [],
      message: '',
      messages: {},
      newChatroomName: '',
      chatrooms: [],
      currentChatroomId: 0,
    };
  },
  created() {
    ChatService.setup(this.$cookie.getCookie('jwt'));
  },
  mounted() {
    ChatService.subscribeToMessages((message) => { this.chatMessageCallback(message) });
    this.loadChatrooms().then((chatrooms) => {
      this.joinChatroom(this.chatrooms[0].id) 
    });
  },
  beforeUnmount() {
    ChatService.disconnect();
  },
  computed: {
    ...mapStores(useSessionStore),
  },
  methods: {
    sendMessage() {
      if (this.message == '') { return; }
      ChatService.sendMessage({ chatroomId: this.currentChatroomId, message: this.message });
      this.pushMessage(this.currentChatroomId, { author: 'Me', data: this.message, sentAt: new Date() });
      this.message = '';
    },
    async loadChatrooms() {
      const chatrooms = await this.getChatrooms();
      this.chatrooms.push(...chatrooms);
    },
    joinChatroom(id) {
      this.currentChatroomId = id;
      ChatService.getRoomMessages(id, this.lastMessageTime(id));
      ChatService.joinRoom(id);
    },
    async getChatrooms() {
      try {
        const response = await axios.get(constants.API_URL + '/chatrooms');
        return response.data;
      } catch (error) {
        alert(error.response.data.message);
      }
    },
    async newChatroom() {
      // TODO: clean the input to protect injection
      try {
        const response = await axios.post(constants.API_URL + '/chatrooms',
          {
            name: this.newChatroomName,
          }
        );
        this.chatrooms.push(response.data);
        ChatService.joinRoom(response.data.id);
      } catch (error) {
        alert(error.response.data.message);
      }
      this.newChatroomName = '';
    },
    chatMessageCallback(message) {
      if (message.author === this.sessionStore.nickname) {
        message.author = 'Me';
      }
      this.pushMessage(message.chatroomId, message);
    },
    pushMessage(chatroomId, message) {
      if (!this.messages.hasOwnProperty(chatroomId)) { this.messages[chatroomId] = []; }
      this.messages[chatroomId].push(message);
    },
    lastMessageTime(chatroomId) {
      if (!this.messages.hasOwnProperty(chatroomId) || this.messages[chatroomId].length < 1) { return new Date(null); }
      return new Date(this.messages[chatroomId].at(-1).sentAt);
    }
  }
};

</script>
