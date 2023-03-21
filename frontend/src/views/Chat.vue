<template>
  <h1>Chat</h1>
	<v-container fuild>
		<v-row justify="space-between" align="start">
			<v-col cols="3">
			  <v-card height="1000">
				HERE CHANS
			  </v-card>
			</v-col>
			<v-col cols="9">
			  <v-card>
			      <v-list ref="chat" height="1000" class="overflow-y-auto">
			        <div v-for="item in messages">
			          From [{{ item.author }}]: {{item.data }}
			        </div>
			      </v-list>
			  </v-card>
			</v-col>
		</v-row>
		<v-row justify="space-between" align="start">
			<v-col cols="3">
        <v-text-field
	          v-model="chans"
	          label="Create chan"
	        ></v-text-field>
			</v-col>
			<v-col cols="9">
			  <v-card>
			      <v-form @submit.prevent>
			        <v-text-field
			          v-model="message"
			          label="Message"
			          v-on:keyup.enter="sendMessage"
			        ></v-text-field>
			      </v-form>
			  </v-card>
			</v-col>
		</v-row>
	</v-container>
</template>

<script>
import axios from 'axios';
import * as constants from '@/constants';
import SocketioService from '../services/socketio.service';
import { mapStores } from 'pinia';
import { useSessionStore } from '@/store/session';

export default {
  data() {
    return {
      users: [],
      message: '',
      messages: [],
    };
  },
  created() {
    SocketioService.setupSocketConnection(this.$cookie.getCookie('jwt'));
  },
  mounted() {
    SocketioService.subscribe("msgToClient", (message) => {
      if (message.author === this.sessionStore.nickname) {
        message.author = 'Me';
      }
      this.messages.push(message);
      this.$nextTick(() => {
        this.$refs.chat.$el.scrollTop = this.$refs.chat.$el.scrollHeight;
      });
    });
  },
  beforeUnmount() {
    SocketioService.disconnect();
  },
  computed: {
    ...mapStores(useSessionStore),
  },
  methods: {
    sendMessage() {
      if (this.message == '') { return; }
      SocketioService.sendMessage("msgToServer", this.message);
      // SocketioService.sendMessage("testChannel", this.message);
      this.messages.push({ author: 'Me', data: this.message });
      this.message = '';
      console.table(this.messages);
      this.$nextTick(() => {
        this.$refs.chat.$el.scrollTop = this.$refs.chat.$el.scrollHeight;
      });
    }
  },
};

</script>
