<template>
  <h1>Chat</h1>
  <v-card>
    <v-card-text>
      <v-list ref="chat" height="100" class="overflow-y-auto">
        <div v-for="item in messages">
          From [{{ item.author }}]: {{item.data }}
        </div>
      </v-list>
    </v-card-text>
    <v-card-actions>
      <v-form @submit.prevent>
        <v-text-field
          v-model="message"
          label="Message"
          v-on:keyup.enter="sendMessage"
        ></v-text-field>
      </v-form>
    </v-card-actions>
  </v-card>
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
