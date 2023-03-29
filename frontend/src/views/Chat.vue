<template>
  <h1>Chat</h1>

	<v-container fluid>

		<v-row justify="space-between" align="start">
			<v-col cols="3">
			  <v-card height="1000">
          <v-list>
    				<v-list-item
              v-for="chatroom in chatrooms"
              :key="chatroom.id"
              :title="chatroom.name"
              :value="chatroom.name"
              :active="chatroom.id == currentChatroomId"
              @click="joinChatroom(chatroom.id)"
            ></v-list-item>
          </v-list>
			  </v-card>
			</v-col>
			<v-col cols="6">
			  <v-card>
			      <v-list ref="chat" height="1000" class="overflow-y-auto">
			        <div v-for="item in messages[currentChatroomId]" :key="item.data">
			          <p class="text-right ma-2" ><a v-if="item.author === 'Me'" class="rounded-pill pa-1 bg-blue">{{item.data }}</a></p>
			          <p class="text-left ma-2"><a v-if="item.author !== 'Me'" class="rounded-pill pa-1 bg-green" >{{ item.author }}: {{item.data }}</a></p>
			        </div>
			      </v-list>
			  </v-card>
			</v-col>
      <v-col cols="3">
        <v-card>
          <v-list>
          </v-list>
        </v-card>
      </v-col>
		</v-row>
		<v-row justify="space-between" align="start">
			<v-col cols="3">
        <v-text-field
              v-model="newChatroomName"
              label="New chatroom"
              @keyup.enter="newChatroom"
            ></v-text-field>
			</v-col>
			<v-col cols="6">
				<v-text-field
 					v-model="message"
					label="Message"
					@keyup.enter="sendMessage"
       ></v-text-field>
			</v-col>
      <v-col cols="3"></v-col>
		</v-row>
	</v-container>
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
  computed: {
    ...mapStores(useSessionStore),
  },
  created() {
    ChatService.setup(this.$cookie.getCookie('jwt'));
  },
  mounted() {
    ChatService.subscribeToMessages((message) => { this.chatMessageCallback(message) });
    this.loadChatrooms().then((chatrooms) => {
      this.joinChatroom(chatrooms[0].id) 
    });
  },
  beforeUnmount() {
    ChatService.disconnect();
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

      return chatrooms;
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
      this.$nextTick(() => {
        this.$refs.chat.$el.scrollTop = this.$refs.chat.$el.scrollHeight;
      });
    },
    pushMessage(chatroomId, message) {
      // eslint-disable-next-line no-prototype-builtins
      if (!this.messages.hasOwnProperty(chatroomId)) { this.messages[chatroomId] = []; }
      this.messages[chatroomId].push(message);
    },
    lastMessageTime(chatroomId) {
      // eslint-disable-next-line no-prototype-builtins
      if (!this.messages.hasOwnProperty(chatroomId) || this.messages[chatroomId].length < 1) { return new Date(null); }
      return new Date(this.messages[chatroomId].at(-1).sentAt);
    }
  },
};

</script>
