<template>
  <v-card height="1000">
    <v-list>
      <v-list-subheader>Chatrooms</v-list-subheader>
      <v-list-item
        v-for="chatroom in chatrooms"
        :key="chatroom.id"
        :title="chatroom.name"
        :value="chatroom.name"
        :active="chatroom.id == id"
        @click="join(chatroom.id)"
      ></v-list-item>
    </v-list>
  </v-card>
    <v-row no-gutters>
      <v-col cols="8" class="pa-0">
        <JoinChatroomDialog @join="pushChatroom" />
      </v-col>
      <v-col cols="4" class="pa-0">
        <NewChatroomDialog @create="pushChatroom" />
      </v-col>
    </v-row>
</template>

<script>
import axios from 'axios';
import * as constants from '@/constants';
import swal from 'sweetalert';
import formatError from '@/utils/lib';
import NewChatroomDialog from '../components/NewChatroomDialog.vue';
import JoinChatroomDialog from '../components/JoinChatroomDialog.vue';

import { mapStores } from 'pinia';
import { useChatStore } from '@/store/chat';

export default {
  components: {
    NewChatroomDialog,
    JoinChatroomDialog
  },
  props: [
    'id',
  ],
  emits: [
    'join'
  ],
  computed: {
    ...mapStores(useChatStore),
    chatrooms() {
      return this.chatStore.chatrooms;
    }
  },
  mounted() {
    if (this.chatStore.chatrooms.length > 0) { return ; }
    this.loadChatrooms().then((chatrooms) => {
      this.chatStore.switchToDefaultChatroom();
    });
  },
  methods: {
    join(id) {
      this.$emit('join', id);
    },
    pushChatroom(chatroom) {
      this.chatStore.addRoom(chatroom);
    },
    async loadChatrooms() {
      const chatrooms = await this.getChatrooms();
      this.chatStore.addRoom(...chatrooms);
      return chatrooms;
    },
    async getChatrooms() {
      try {
        const response = await axios.get(constants.API_URL + '/chatrooms/mine');
        return response.data;
      } catch (error) {
        swal({
          icon: 'error',
          text: formatError(error.response.data.message)
        });
      }
    },
  }
}

</script>
