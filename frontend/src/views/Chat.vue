<template>
  <h1>Chat</h1>
  <v-sheet width="300" class="mx-auto">
    <div v-for="message in messages">
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
      messages: []
    };
  },
  computed: {
    ...mapStores(useSessionStore)
  },
  created() {
    SocketioService.setupSocketConnection(this.$cookie.getCookie('jwt'));
  },
  mounted() {
    SocketioService.subscribe('msgToClient', (message) => {
      if (message.author === this.sessionStore.nickname) {
        message.author = 'Me';
      }
      this.messages.push(message);
    });
  },
  beforeUnmount() {
    SocketioService.disconnect();
  },
  methods: {
    sendMessage() {
      if (this.message == '') {
        return;
      }
      SocketioService.sendMessage('msgToServer', this.message);
      // SocketioService.sendMessage("testChannel", this.message);
      this.messages.push({ author: 'Me', data: this.message });
      this.message = '';
    }
  }
};
</script>
