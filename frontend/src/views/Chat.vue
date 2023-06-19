<template>
  <v-container fluid>
    <v-row justify="space-between" align="start">
      <v-col cols="3">
        <Chatrooms
          :id="currentChatroomId"
          :show-friends="showFriends"
          :show-public-channel="showPublicChannel"
          :show-private-channel="showPrivateChannel"
          @join="joinChatroom"
          @toggle-friends-view="toggleFriendsView"
          @toggle-chat-view="toggleChatView"
          @toggle-public-channel-view="togglePublicChannelView"
        />
      </v-col>
      <v-col cols="6">
        <Chat
          v-if="showPrivateChannel"
          :id="currentChatroomId"
          :messages="messages"
          @leave="leaveRoom"
          @delete="leaveRoom"
        />
        <Friends v-else-if="showFriends" />
        <JoinChatroom v-else-if="showPublicChannel" />
      </v-col>
      <v-col cols="3">
        <ChatroomUsers :id="currentChatroomId" v-if="showPrivateChannel" />
        <OnlineFriends v-else />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import ChatService from '../services/chat.service';
import swal from 'sweetalert';
import * as lib from '@/utils/lib';
import BlockUserService from '../services/blockUser.service';
import { mapStores } from 'pinia';
import { useSessionStore } from '@/store/session';
import { useChatStore } from '@/store/chat';
import Chat from '../components/Chat.vue';
import Chatrooms from '../components/Chatrooms.vue';
import ChatroomUsers from '../components/ChatroomUsers.vue';
import Friends from '../components/Friends.vue';
import OnlineFriends from '../components/OnlineFriends.vue';
import JoinChatroom from '../components/JoinChatroom.vue';

export default {
  components: {
    Chat,
    Chatrooms,
    ChatroomUsers,
    Friends,
    OnlineFriends,
    JoinChatroom
  },
  data() {
    return {
      showFriends: true,
      showPublicChannel: false,
      showPrivateChannel: false
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
    ChatService.setup(this.$cookie.getCookie('jwt'), this.displayError);
    BlockUserService.getBlockedUsers(this.sessionStore.nickname);
  },
  mounted() {
    ChatService.subscribeToMessages((message) => {
      ChatService.storeMessage(message);
    });
  },
  beforeUnmount() {
    ChatService.disconnect();
  },
  methods: {
    displayError(payload) {
      swal({
        icon: 'error',
        text: lib.formatError(payload.message)
      });
    },
    joinChatroom(id) {
      this.chatStore.joinRoom(id);
      this.showFriends = false;
      this.showPublicChannel = false;
      this.showPrivateChannel = true;
    },
    leaveRoom(id) {
      this.chatStore.removeRoom(id);
      if (id === this.currentChatroomId) {
        this.chatStore.switchToDefaultChatroom();
      }
    },
    toggleFriendsView() {
      this.showFriends = true;
      this.showPublicChannel = false;
      this.showPrivateChannel = false;
    },
    toggleChatView() {
      this.showFriends = false;
      this.showPublicChannel = false;
      this.showPrivateChannel = true;
    },
    togglePublicChannelView() {
      this.showFriends = false;
      this.showPublicChannel = true;
      this.showPrivateChannel = false;
    }
  }
};
</script>

<style scoped></style>
