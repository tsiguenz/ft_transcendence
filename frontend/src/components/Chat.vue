<template>
  <v-list ref="chat" height="1000" class="overflow-y-auto">
    <v-toolbar color="">
      <v-toolbar-title>{{ title }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <EditChatroomDialog
        v-if="currentUserIsOwner"
        :id="id"
        @delete="(roomId) => $emit('delete', roomId)"
      />
      <v-btn icon="mdi-exit-to-app" @click="leaveRoom"></v-btn>
    </v-toolbar>
    <div v-for="item in messages" :key="item.sentAt">
      <p class="text-right ma-2">
        <a
          v-if="item.authorId === currentUserId"
          class="rounded-pill pa-1 bg-blue"
          >{{ item.data }}</a
        >
      </p>
      <p class="text-left ma-2">
        <a
          v-if="item.authorId !== currentUserId"
          class="rounded-pill pa-1 bg-green"
          >{{ item.authorNickname }}: {{ item.data }}</a
        >
      </p>
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
import * as lib from '@/utils/lib';
import EditChatroomDialog from '../components/EditChatroomDialog.vue';

export default {
  components: {
    EditChatroomDialog
  },
  props: ['id', 'title', 'messages'],
  emits: ['leave', 'delete'],
  data() {
    return {
      newMessage: ''
    };
  },
  computed: {
    ...mapStores(useSessionStore, useChatStore),
    currentUserId() {
      return this.sessionStore.userId;
    },
    currentUserIsOwner() {
      const currentUser = this.chatStore.users.find(
        (x) => x.id === this.currentUserId
      );
      if (!currentUser || currentUser.role !== 'OWNER') {
        return false;
      }
      return true;
    }
  },
  watch: {
    messages: {
      handler() {
        this.$nextTick(() => {
          this.$refs.chat.$el.scrollTop = this.$refs.chat.$el.scrollHeight;
        });
      },
      deep: true
    },
    id: {
      handler() {
        if (!this.id) {
          return;
        }

        ChatService.joinRoom(this.id);
        ChatService.getRoomMessages(this.id, this.lastMessageTime());
      }
    }
  },
  created() {
    ChatService.setup(this.$cookie.getCookie('jwt'), this.displayError);
  },
  mounted() {
    ChatService.subscribeToMessages((message) => {
      ChatService.storeMessage(message);
    });
    ChatService.subscribeToKick((payload) => {
      this.$emit('leave', payload.chatroomId);
    });
  },
  beforeUnmount() {
    ChatService.disconnect();
  },
  methods: {
    sendMessage() {
      if (this.newMessage == '') {
        return;
      }
      ChatService.sendMessage({
        chatroomId: this.id,
        message: this.newMessage
      });
      this.newMessage = '';
    },
    leaveRoom() {
      this.$emit('leave', this.id);
      ChatService.leaveRoom(this.id);
    },
    lastMessageTime() {
      // eslint-disable-next-line no-prototype-builtins
      if (!this.messages || this.messages.length < 1) {
        return new Date(null);
      }
      return new Date(this.messages.at(-1).sentAt);
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
