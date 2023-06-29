<template>
  <v-toolbar class="roomName">
    <v-toolbar-title>{{ currentChatroomName() }}</v-toolbar-title>
    <v-spacer></v-spacer>
    <EditChatroomDialog
      v-if="currentUserIsOwner"
      :id="id"
      @delete="(roomId) => $emit('delete', roomId)"
    />
    <v-btn v-if="id" icon="mdi-exit-to-app" @click="leaveRoom"></v-btn>
  </v-toolbar>
  <v-list ref="chat" class="overflow-y-auto window chating">
    <div v-for="message in messages" :key="message.id">
      <div v-if="message.authorId === currentUserId">
        <span class="text-right my-2 msg">
          <ChatPrintNicknameAvatarMessage
            :user-id="message.authorId"
            :message="message.data"
            :sender-is-current-user="true"
          />
        </span>
      </div>
      <div v-if="message.authorId !== currentUserId">
        <span class="text-left my-2 msgOther">
          <ChatPrintNicknameAvatarMessage
            :user-id="message.authorId"
            :message="message.data"
            :sender-is-current-user="false"
          />
        </span>
      </div>
    </div>
  </v-list>
  <v-text-field
    v-model="newMessage"
    label="Message"
    @keyup.enter="sendMessage"
  ></v-text-field>
</template>

<script>
import ChatService from '../services/chat.service';
import { mapStores } from 'pinia';
import { useSessionStore } from '@/store/session';
import { useChatStore } from '@/store/chat';
import * as constants from '@/constants.ts';
import * as lib from '@/utils/lib';
import EditChatroomDialog from '../components/EditChatroomDialog.vue';
import ChatPrintNicknameAvatarMessage from '../components/ChatPrintNicknameAvatarMessage.vue';
import axios from 'axios';
import swal from 'sweetalert';

export default {
  components: {
    EditChatroomDialog,
    ChatPrintNicknameAvatarMessage
  },
  props: ['id', 'messages'],
  emits: ['leave', 'delete'],
  data() {
    return {
      newMessage: '',
      chatroom: []
    };
  },
  computed: {
    ...mapStores(useSessionStore, useChatStore),
    currentUserId() {
      return this.sessionStore.userId;
    },
    currentUserIsOwner() {
      const currentUser = this.chatStore.currentChatroomUser;
      if (!currentUser || currentUser.role !== 'OWNER') {
        return false;
      }
      return true;
    },
    getAvatarUrlComputed() {
      return (avatarPath) => {
        return constants.AVATARS_URL + avatarPath;
      };
    }
  },
  watch: {
    messages: {
      handler() {
        this.$nextTick(() => {
          this.$refs.chat.$el.scrollTop = this.$refs.chat.$el.scrollHeight;
        });
      },
      deep: true,
      immediate: true
    },
    id: {
      handler() {
        if (!this.id) {
          return;
        }
        this.connectRoom();
      }
    }
  },
  async mounted() {
    this.connectRoom();
    ChatService.subscribeToKick((payload) => {
      this.$emit('leave', payload.chatroomId);
    });
  },
  methods: {
    connectRoom() {
      ChatService.connectRoom(this.id);
      ChatService.getRoomMessages(this.id, this.lastMessageTime());
    },
    sendMessage() {
      if (this.newMessage !== '') {
        ChatService.sendMessage({
          chatroomId: this.id,
          message: this.newMessage
        });
        this.newMessage = '';
      }
    },
    leaveRoom() {
      ChatService.leaveRoom(this.id);
      this.$emit('leave', this.id);
    },
    lastMessageTime() {
      if (!this.messages || this.messages.length < 1) {
        return new Date(null);
      }
      return new Date(this.messages.at(-1).sentAt);
    },
    currentChatroomName() {
      if (!this.id) {
        return '';
      }
      const chatroom = this.chatStore.chatrooms.find((x) => x.id === this.id);
      if (!chatroom) {
        return '';
      }
      return chatroom.name;
    }
  }
};
</script>

<style scoped>
.roomName {
  background-color: var(--medium-purple);
}
.chating {
  height: 70vh;
}
.msg {
  display: flex;
  justify-content: end;
}
.msgOther {
  display: flex;
}
</style>
