<template>
  <v-list>
    <v-btn block>Invite users</v-btn>
    <v-list-subheader>Users</v-list-subheader>
    <v-list-group v-for="user in users" :key="user.id">
      <template v-slot:activator="{ props }">
        <v-list-item
          v-bind="props"
          :prepend-icon="userRoleIcon[user.role]"
          :class="{
            'blue-border': isCurrentUser(user.id),
            online: isOnline(user.id)
          }"
          :title="user.nickname"
        ></v-list-item>
      </template>
      <div v-if="!isCurrentUser(user.id)" class="ma-0">
        <div v-if="currentUserIsOwner">
          <v-btn v-if="user.role === 'USER'" @click="promote(user.id)" block
            >Make admin</v-btn
          >
          <v-btn
            v-else-if="user.role === 'ADMIN'"
            @click="demote(user.id)"
            block
            >Revoke admin</v-btn
          >
        </div>
        <div v-if="canBeAdministered(user.role)">
          <v-btn @click="kick(user.id)" block>Kick</v-btn>
          <v-btn v-if="isUserMuted(user.id)" @click="unmute(user.id)" block
            >Unmute</v-btn
          >
          <RestrictUserDialog
            v-else
            action="Mute"
            :nickname="user.nickname"
            :userId="user.id"
            @restrict="mute"
          />
          <v-btn v-if="isUserBanned(user.id)" @click="unban(user.id)" block
            >Unban</v-btn
          >
          <RestrictUserDialog
            v-else
            action="Ban"
            :nickname="user.nickname"
            :userId="user.id"
            @restrict="ban"
          />
        </div>
        <v-btn
          v-if="!isUserBlocked(user.id)"
          @click="blockUser(user.nickname)"
          block
          >Block</v-btn
        >
        <v-btn v-else @click="unblockUser(user.nickname)" block>Unblock</v-btn>
      </div>
    </v-list-group>
  </v-list>
</template>

<script>
import axios from 'axios';
import * as constants from '@/constants';
import swal from 'sweetalert';
import * as lib from '@/utils/lib';
import ChatService from '../services/chat.service';
import BlockUserService from '../services/blockUser.service';
import { mapStores } from 'pinia';
import { useSessionStore } from '@/store/session';
import { useChatStore } from '@/store/chat';
import { useConnectedUsersStore } from '@/store/connectedUsers';
import RestrictUserDialog from '../components/RestrictUserDialog.vue';

export default {
  components: {
    RestrictUserDialog
  },
  props: ['id'],
  data() {
    return {
      userRoleIcon: {
        OWNER: 'mdi-crown-circle',
        ADMIN: 'mdi-alpha-a-circle',
        USER: 'mdi-account-circle'
      }
    };
  },
  computed: {
    ...mapStores(useSessionStore, useChatStore, useConnectedUsersStore),
    users() {
      return this.chatStore.users;
    },
    currentUserId() {
      return this.sessionStore.userId;
    },
    currentUserIsAdmin() {
      const currentUser = this.chatStore.users.find(
        (user) => user.id == this.currentUserId
      );

      return currentUser.role === 'OWNER' || currentUser.role === 'ADMIN';
    },
    currentUserIsOwner() {
      const currentUser = this.chatStore.users.find(
        (user) => user.id == this.currentUserId
      );

      return currentUser.role === 'OWNER';
    }
  },
  watch: {
    id: {
      handler() {
        if (!this.id) {
          this.chatStore.users = [];
          return;
        }
        this.getChatroomUsers(this.id).then((users) => {
          this.chatStore.users = users;
        });
      }
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
    async promote(userId) {
      try {
        const response = await axios.post(
          constants.API_URL +
            '/chatrooms/' +
            this.id +
            '/users/' +
            userId +
            '/promote'
        );
        this.chatStore.setUserRole(userId, this.id, response.data.role);
        return response.data;
      } catch (error) {
        swal({
          icon: 'error',
          text: lib.formatError(error.response.data.message)
        });
      }
    },
    async demote(userId) {
      try {
        const response = await axios.post(
          constants.API_URL +
            '/chatrooms/' +
            this.id +
            '/users/' +
            userId +
            '/demote'
        );
        this.chatStore.setUserRole(userId, this.id, response.data.role);
        return response.data;
      } catch (error) {
        swal({
          icon: 'error',
          text: lib.formatError(error.response.data.message)
        });
      }
    },
    async getChatroomUsers(chatroomId) {
      try {
        const response = await axios.get(
          constants.API_URL + '/chatrooms/' + chatroomId + '/users'
        );
        return response.data;
      } catch (error) {
        swal({
          icon: 'error',
          text: lib.formatError(error.response.data.message)
        });
      }
    },
    canBeAdministered(userRole) {
      return this.currentUserIsAdmin && userRole !== 'OWNER';
    },
    isUserMuted(userId) {
      return this.chatStore
        .getUserRestrictions(userId)
        .filter((restriction) => restriction.type == 'MUTED').length;
    },
    isUserBanned(userId) {
      return this.chatStore
        .getUserRestrictions(userId)
        .filter((restriction) => restriction.type == 'BANNED').length;
    },
    isCurrentUser(userId) {
      return this.currentUserId === userId;
    },
    isOnline(id) {
      return this.connectedUsersStore.isConnected(id);
    },
    async blockUser(username) {
      BlockUserService.blockUser(username);
    },
    async unblockUser(username) {
      BlockUserService.unblockUser(username);
    },
    isUserBlocked(userId) {
      return BlockUserService.isUserBlocked(userId);
    },
    mute(params) {
      ChatService.muteUser(params.userId, this.id, params.time);
      this.chatStore.setUserRestriction(params.userId, 'MUTED', params.time);
    },
    ban(params) {
      ChatService.banUser(params.userId, this.id, params.time);
      this.chatStore.setUserRestriction(params.userId, 'BANNED', params.time);
    },
    unmute(userId) {
      ChatService.unmuteUser(userId, this.id);
      this.chatStore.removeUserRestriction(userId, 'MUTED');
    },
    unban(userId) {
      ChatService.unbanUser(userId, this.id);
      this.chatStore.removeUserRestriction(userId, 'BANNED');
    },
    kick(userId) {
      ChatService.kickUser(userId, this.id);
    }
  }
};
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
