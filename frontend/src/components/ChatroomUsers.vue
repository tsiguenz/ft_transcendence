<template>
  <v-list class="window">
    <InviteUserDialog :id="id" />
    <v-list-subheader>Users</v-list-subheader>
    <v-list-group v-for="user in users" :key="user.id">
      <template #activator="{ props }">
        <v-list-item
          v-if="isCurrentUser(user.id)"
          :prepend-icon="userRoleIcon[user.role]"
          :class="{
            'blue-border': isCurrentUser(user.id),
            online: isOnline(user.id)
          }"
          :title="user.nickname"
        ></v-list-item>
        <v-list-item
          v-else
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
        <InviteUserToPlay :user-id="user.id" />
        <v-btn class="button" block @click="privateMessage(user.id)"
          >Private message</v-btn
        >
        <div v-if="currentUserIsOwner">
          <v-btn
            v-if="user.role === 'USER'"
            class="button"
            block
            @click="promote(user.id)"
            >Make admin</v-btn
          >
          <v-btn
            v-else-if="user.role === 'ADMIN'"
            class="button"
            block
            @click="demote(user.id)"
            >Revoke admin</v-btn
          >
        </div>
        <div v-if="canBeAdministered(user.role)">
          <v-btn class="button" block @click="kick(user.id)">Kick</v-btn>
          <v-btn
            v-if="isUserMuted(user.id)"
            class="button"
            block
            @click="unmute(user.id)"
            >Unmute</v-btn
          >
          <RestrictUserDialog
            v-else
            action="Mute"
            :nickname="user.nickname"
            :user-id="user.id"
            @restrict="mute"
          />
          <v-btn
            v-if="isUserBanned(user.id)"
            class="button"
            block
            @click="unban(user.id)"
            >Unban</v-btn
          >
          <RestrictUserDialog
            v-else
            action="Ban"
            :nickname="user.nickname"
            :user-id="user.id"
            @restrict="ban"
          />
        </div>
        <v-btn
          v-if="!isUserBlocked(user.id)"
          class="button"
          block
          @click="blockUser(user.nickname)"
          >Block</v-btn
        >
        <v-btn v-else class="button" block @click="unblockUser(user.nickname)"
          >Unblock</v-btn
        >
      </div>
    </v-list-group>
  </v-list>
  <v-list class="window">
  <v-list-subheader>Banned users</v-list-subheader>
  <v-list-group v-for="bannedUser in bannedUsers" :key="bannedUser.id">
    <template #activator="{ props }">
      <v-list-item
        v-bind="props"
        :title="getUserBannedName(bannedUser.usierId)"
      ></v-list-item>
      <v-btn block @click="unban(bannedUser.id)">Unban</v-btn>
    </template>
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
import InviteUserDialog from '../components/InviteUserDialog.vue';
import InviteUserToPlay from '../components/InviteUserToPlay.vue';

export default {
  components: {
    RestrictUserDialog,
    InviteUserDialog,
    InviteUserToPlay
  },
  props: ['id'],
  data() {
    return {
      bannedUsers: [],
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
        this.setRoomUsers();
      }
    },
    users: {
      immediate: true,
      handler(newValue) {
        // Check if the current user is an owner
        const currentUser = newValue.find((user) => user.id == this.currentUserId);
        if (currentUser && currentUser.role === 'OWNER') {
          this.getBanned(this.id);
        }
      }
    }
  },
  mounted() {
    this.setRoomUsers();
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
    async getBanned(chatroomId) {
      if (this.currentUserIsOwner) {
        const response = await axios.get(
          constants.API_URL + '/chatrooms/' + chatroomId + '/restrictions'
        );
       
        this.bannedUsers = response.data; // <- store the banned users here
        console.log(this.bannedUsers);
        return response.data;
      } else {
        console.log('Error: Only the owner can view banned users.');
      }
    },
    async getUserBannedName(id){
      const response = await axios.get(
        constants.API_URL + '/users/' + id
      );
      console.log(response.data)
      return response.data.nickname;
    },
    setRoomUsers() {
      if (!this.id) {
        this.chatStore.users = [];
        return;
      }
      this.getChatroomUsers(this.id).then((users) => {
        this.chatStore.users = users;
      });
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
    },
    privateMessage(userId) {
      ChatService.createOneToOne(this.currentUserId, userId);
    },
    inviteUser() {
      ChatService.inviteUser(this.id, 'REPLACE-ME');
    }
  }
};
</script>

<style scoped>
.online {
  color: lightgreen;
}

.blocked {
  text-decoration: line-through;
}

.blue-border:deep(.mdi-chevron-down) {
  display: none;
}
.blue-border {
  background-color: var(--light-purple);
}
.button {
  background: var(--medium-purple) !important;
}
</style>
