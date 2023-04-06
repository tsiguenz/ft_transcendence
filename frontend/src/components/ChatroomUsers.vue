<template>
  <v-list>
    <v-list-subheader>Users</v-list-subheader>
    <v-list-item
      v-for="user in users"
      :key="user.id"
      prepend-icon="mdi-account-circle"
      :title="user.nickname"
      :class="{ 'blue-border': isCurrentUser(user.id) }"
    ></v-list-item>
  </v-list>
</template>

<script>
import axios from 'axios';
import * as constants from '@/constants';
import ChatService from '../services/chat.service';
import { mapStores } from 'pinia';
import { useSessionStore } from '@/store/session';
import { useChatStore } from '@/store/chat';

export default {
  props: ['id'],
  data() {
    return {
      users: []
    }
  },
  computed: {
    ...mapStores(useSessionStore, useChatStore),
    currentUserId() {
      return this.sessionStore.userId;
    }
  },
  watch: {
    id: {
      handler() {
        this.getChatroomUsers(this.id).then((users) => {
          this.users = users;
        });
      },
    }
  },
  beforeUnmount() {
    ChatService.disconnect();
  },
  methods: {
    async getChatroomUsers(chatroomId) {
      try {
        const response = await axios.get(constants.API_URL + '/chatrooms/' + chatroomId + '/users');
        return response.data;
      } catch (error) {
        alert(error.response.data.message);
      }
    },
    isCurrentUser(userId) {
      return this.currentUserId === userId;
    }
  },
}
</script>

<style scoped>
  .blue-border {
    border-color: blue;
    border-width: 5px;
  }
</style>
