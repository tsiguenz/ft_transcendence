<template>
  <h1>Chat</h1>
  <v-sheet width="300" class="mx-auto">
    <div v-for="message in messages">
      {{ message.data }}
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
import * as constants from '@/constants.ts';
import SocketioService from '../services/socketio.service';

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
      console.log("Server: " + message);
      this.messages.push(message);
    });
  },
  beforeUnmount() {
    SocketioService.disconnect();
  },
  methods: {
    sendMessage() {
      if (this.message == '') { return; }
      SocketioService.sendMessage("msgToServer", this.message);
      // SocketioService.sendMessage("testChannel", this.message);
      this.messages.push({ data: this.message });
      this.message = '';
    }
  }
};

</script>
