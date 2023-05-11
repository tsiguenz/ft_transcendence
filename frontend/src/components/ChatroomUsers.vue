<template>
  <v-list>
    <v-btn block>Invite users</v-btn>
    <v-list-subheader>Users</v-list-subheader>
    <v-list-group
      v-for="user in users"
      :key="user.id"
    >
      <template v-slot:activator="{ props }">
        <v-list-item
          v-bind="props"
          :prepend-icon="userRoleIcon[user.role]"
          :class="{ 'blue-border': isCurrentUser(user.id), 'online': isOnline(user.id) }"
          :title="user.nickname"
        ></v-list-item>
      </template>
      <v-row v-if="!isCurrentUser(user.id)" class="ma-0">
        <v-btn v-if="currentUserIsAdmin" block>Make admin</v-btn>
        <v-btn v-if="currentUserIsAdmin" block>Mute</v-btn>
        <v-btn v-if="currentUserIsAdmin" block>Ban</v-btn>
        <v-btn v-if="!isUserBlocked(user.id)" @click="blockUser(user.nickname)" block>Block</v-btn>
        <v-btn v-else @click="unblockUser(user.nickname)" block>Unblock</v-btn>
      </v-row>
    </v-list-group>
  </v-list>
</template>

<script>
import axios from 'axios';
import * as constants from '@/constants';
import swal from 'sweetalert';
import formatError from '@/utils/lib';
import ChatService from '../services/chat.service';
import { mapStores } from 'pinia';
import { useSessionStore } from '@/store/session';
import { useChatStore } from '@/store/chat';
import { useConnectedUsersStore } from '@/store/connectedUsers';

export default {
  props: ['id'],
  data() {
    return {
      users: [],
      userRoleIcon: {
        'OWNER': 'mdi-crown-circle',
        'ADMIN': 'mdi-alpha-a-circle',
        'USER': 'mdi-account-circle'
      } 
    }
  },
  computed: {
    ...mapStores(useSessionStore, useChatStore, useConnectedUsersStore),
    currentUserId() {
      return this.sessionStore.userId;
    },
    currentUserIsAdmin() {
      const currentUser = this.users.find((user) => user.id == this.currentUserId);

      return currentUser.role === 'OWNER' || currentUser.role === 'ADMIN';
    }
  },
  watch: {
    id: {
      handler() {
        if (!this.id) {
          this.users = [];
          return;
        }
        this.getChatroomUsers(this.id).then((users) => {
          this.users = users;
        });
      },
    }
  },
  mounted() {
    // TODO: Make it all work, one day
    // ChatService.subscribeToUsers((payload) => {
    //   ChatService.storeUser(payload);
    // }, (payload) => {
    //   ChatService.removeUserFromRoom(payload);
    // });
    // ChatService.getOnlineUsers(this.id);
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
        swal({
          icon: 'error',
          text: formatError(error.response.data.message)
        });
      }
    },
    isCurrentUser(userId) {
      return this.currentUserId === userId;
    },
    isOnline(id) {
      return this.connectedUsersStore.isConnected(id);
    },
    async blockUser(username) {
     try {
        const response = await axios.post(constants.API_URL + '/users/' + username + '/block', {});
        this.sessionStore.addBlockedUser(response.data.blockedId);
      } catch (error) {
        swal({
          icon: 'error',
          text: formatError(error.response.data.message)
        });
      }
    },
    async unblockUser(username) {
     try {
        const response = await axios.post(constants.API_URL + '/users/' + username + '/unblock', {});
        this.sessionStore.removeBlockedUser(response.data.blockedId);
      } catch (error) {
        swal({
          icon: 'error',
          text: formatError(error.response.data.message)
        });
      }
    },
    isUserBlocked(userId) {
      return this.sessionStore.isUserBlocked(userId);
    }
  },
}
</script>

<style scoped>
  .blue-border {
    border-color: blue;
    border-width: 5px;
  }

  .online {
    color: lightgreen;
  }

  .blocked {
    text-decoration: line-through;
  }
</style>
