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
    <div v-for="message in messages" :key="message.sentAt">
      <div v-if="message.authorId === currentUserId" class="author">
        <p class="name">{{ message.authorNickname }}</p>
        <span class="text-right ma-2 msg">
          <p class="bubble pa-1 bg-blue msg-content">{{ message.data }}</p>
          <ProfilePrintAvatar
            :wdt="40"
            :hgt="40"
            :url-avatar="getAvatarUrlComputed(message.authorAvatarUrl)"
          ></ProfilePrintAvatar>
        </span>
      </div>
      <div v-if="message.authorId !== currentUserId" class="other">
        <p class="nameOther">{{ message.authorNickname }}</p>
        <span class="text-left ma-2 msgOther">
          <ProfilePrintAvatar
            :wdt="40"
            :hgt="40"
            :url-avatar="getAvatarUrlComputed(message.authorAvatarUrl)"
          ></ProfilePrintAvatar>
          <p class="bubble pa-1 bg-green msg-content">{{ message.data }}</p>
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
import swal from 'sweetalert';
import * as constants from '@/constants.ts';
import EditChatroomDialog from '../components/EditChatroomDialog.vue';
import ProfilePrintAvatar from '../components/ProfilePrintAvatar.vue';

export default {
  components: {
    EditChatroomDialog,
    ProfilePrintAvatar
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
  mounted() {
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
    },
    displayError(payload) {
      swal({
        icon: 'error',
        text: lib.formatError(payload.message)
      });
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
  gap: 10px;
}
.msgOther {
  display: flex;
  gap: 10px;
}

.bubble {
  border-radius: 5px;
}

.name {
  text-align: end;
  padding-right: 10px;
  font-size: 10px;
}

.nameOther {
  padding-left: 10px;
  font-size: 10px;
}

.msg-content {
  max-width: 300px;
  word-wrap: break-word;
  text-align: left;
}
</style>
