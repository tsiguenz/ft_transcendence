<template>
  <v-list class="window">
    <v-card class="borderR">
      <v-btn
        :class="`${showFriends === true ? 'activebtn' : 'inactivebtn'}`"
        @click="$emit('toggleFriendsView')"
        ><v-avatar rounded="0" size="25px">
          <v-img
            class="icons-avatar"
            src="/assets/icons/friends.png"
          ></v-img></v-avatar
        >My friends</v-btn
      >
    </v-card>
    <v-card class="borderR">
      <v-btn
        :class="`${showPublicChannel === true ? 'activebtn' : 'inactivebtn'}`"
        @click="$emit('togglePublicChannelView')"
        ><v-avatar rounded="0" size="25px">
          <v-img
            class="icons-avatar"
            src="/assets/icons/friends.png"
          ></v-img></v-avatar
        >Public Channels</v-btn
      >
    </v-card>
    <v-card>
      <v-list class="soc">
        <p class="titleMessages">MESSAGES</p>
        <v-list-item
          v-for="chatroom in chatrooms"
          :key="chatroom.id"
          :class="{
            activeR:
              chatroom.id === activeRoomId &&
              !showFriends &&
              !showPublicChannel,
            inactiveR: chatroom.id !== activeRoomId && !showFriends
          }"
          :title="chatroom.name"
          :value="chatroom.name"
          :active="chatroom.id == id"
          @click="join(chatroom.id) && $emit('toggleChatView')"
        ></v-list-item>
      </v-list>
    </v-card>
    <v-row no-gutters>
      <NewChatroomDialog @create="pushChatroom" />
    </v-row>
  </v-list>
</template>

<script>
import axios from 'axios';
import * as constants from '@/constants';
import swal from 'sweetalert';
import * as lib from '@/utils/lib';
import NewChatroomDialog from '../components/NewChatroomDialog.vue';

import { mapStores } from 'pinia';
import { useChatStore } from '@/store/chat';
import { useSessionStore } from '@/store/session';

export default {
  components: {
    NewChatroomDialog
  },
  props: ['id', 'showFriends', 'showPublicChannel', 'showPrivateChannel'],
  emits: [
    'join',
    'toggleChatView',
    'toggleFriendsView',
    'togglePublicChannelView'
  ],
  data() {
    return {
      activeRoomId: false
    };
  },
  computed: {
    ...mapStores(useChatStore, useSessionStore),
    chatrooms() {
      return this.chatStore.chatrooms;
    }
  },
  mounted() {
    if (this.chatStore.chatrooms.length > 0) {
      return;
    }
    this.loadChatrooms().then((_chatrooms) => {
      this.chatStore.switchToDefaultChatroom();
    });
  },
  methods: {
    join(id) {
      this.$emit('join', id);
      this.activeRoomId = id;
    },
    pushChatroom(chatroom) {
      this.chatStore.addRoom(chatroom);
      this.join(chatroom.id);
    },
    async loadChatrooms() {
      const chatrooms = await this.getChatrooms();
      this.chatStore.addRoom(...chatrooms);
      return chatrooms;
    },
    async getChatrooms() {
      try {
        const response = await axios.get(
          constants.API_URL +
            '/users/' +
            this.sessionStore.nickname +
            '/chatrooms'
        );
        return response.data;
      } catch (error) {
        swal({
          icon: 'error',
          text: lib.formatError(error.response.data.message)
        });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.v-btn {
  width: 100%;
  height: 60px;
  display: flex;
  justify-content: flex-start;
}
:deep(.inactivebtn) {
  background-color: var(--dark-purple) !important;
}
:deep(.activebtn) {
  background-color: var(
    --light
  ) !important; /* Lighter background color when active */
  border-radius: 3px 3px 0px 0px !important;
}

.v-avatar {
  margin-right: 10px;
}

.titleMessages {
  margin-left: 10px;
  opacity: 50%;
}

.soc {
  background-color: var(--dark-purple);
}

.v-card {
  border-radius: 0% !important;
}

:deep(.v-list-item__overlay) {
  background-color: var(--dark-purple);
}

.v-list-item.activeR {
  background-color: var(--light-purple) !important;
}
</style>
