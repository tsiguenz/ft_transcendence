<template>
  <h1>Chat</h1>
  <v-sheet width="300" class="mx-auto">
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
  created() {
    SocketioService.setupSocketConnection();
    SocketioService.subscribe("msgToClient", function(message) {
      console.log("Server: " + message);
    });
  },
  beforeUnmount() {
    SocketioService.disconnect();
  },
  data() {
    return {
      users: [],
      message: '',
    };
  },
  methods: {
    sendMessage() {
      if (this.message == '') { return; }
      SocketioService.sendMessage("msgToServer", this.message);
      this.message = '';
    }
  }
};

</script>
