<template>
  <v-container fluid>
    <v-row justify="space-between" align="start">
      <v-col cols="3">
        <Chatrooms
          :id="currentChatroomId"
          :showFriends="showFriends"
          @join="joinChatroom"
          @toggleFriendsView="toggleFriendsView"
          @toggleChatView="toggleChatView"
          @togglePublicChannelView="togglePublicChannelView"
        />
      </v-col>
      <v-col cols="6">
        <template v-if="showPrivateChannel">
          <Chat
            :id="currentChatroomId"
            title="Chat"
            :messages="messages"
            @leave="leaveRoom"
            @delete="leaveRoom"
          />
        </template>
        <template v-else-if="showFriends">
          <Friends />
        </template>
        <template v-else-if="showPublicChannel">
          <PublicChannel />
        </template>
      </v-col>
      <v-col cols="3">
        <template v-if="showPrivateChannel">
          <ChatroomUsers :id="currentChatroomId" />
        </template>
        <template v-else>
          <OnlineFriends />
        </template>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import BlockUserService from '../services/blockUser.service';
import { mapStores } from 'pinia';
import { useSessionStore } from '@/store/session';
import { useChatStore } from '@/store/chat';
import Chat from '../components/Chat.vue';
import Chatrooms from '../components/Chatrooms.vue';
import ChatroomUsers from '../components/ChatroomUsers.vue';
import Friends from '../components/Friends.vue';
import OnlineFriends from '../components/OnlineFriends.vue';
import PublicChannel from '../components/PublicChannel.vue';

export default {
  components: {
    Chat,
    Chatrooms,
    ChatroomUsers,
    Friends,
    OnlineFriends,
    PublicChannel
  },
  data() {
    return {
      showFriends: false,
      showPublicChannel: false,
      showPrivateChannel: true
    };
  },
  computed: {
    ...mapStores(useSessionStore, useChatStore),
    messages() {
      return this.chatStore.activeRoomMessages;
    },
    currentChatroomId() {
      return this.chatStore.activeChatroom;
    }
  },
  created() {
    BlockUserService.getBlockedUsers(this.sessionStore.nickname);
  },
  methods: {
    joinChatroom(id) {
    this.chatStore.activeChatroom = id;
    this.chatStore.hasJoinedRoom = true;
    this.showFriends = false;
    this.showPublicChannel = false;
    this.showPrivateChannel = true;
  },
    leaveRoom(id) {
      if (id === this.currentChatroomId) {
        this.chatStore.switchToDefaultChatroom();
      }
      this.chatStore.removeRoom(id);
      this.chatStore.hasJoinedRoom = false;
    },
    toggleFriendsView() {
      this.showFriends = true;
      this.showPrivateChannel = false;
      this.showPublicChannel = false;
    },
    toggleChatView() {
      this.showFriends = false;
      this.showPrivateChannel = true;
      this.showPublicChannel = false;
    },
    togglePublicChannelView() {
      this.showPublicChannel = true;
      this.showFriends = false;
      this.showPrivateChannel = false;
    }
  }
};
</script>

<style scoped>
/* Your component styles here */
</style>