<template>
  <v-row no-gutters>
    <v-col>
      <h1>JE SUIS LA FDP</h1>
      <JoinChatroomDialog @join="pushChatroom" />
    </v-col>
  </v-row>
</template>

<script>
import axios from 'axios';
import * as constants from '@/constants';
import swal from 'sweetalert';
import * as lib from '@/utils/lib';
import JoinChatroomDialog from '../components/JoinChatroomDialog.vue';

import { mapStores } from 'pinia';
import { useChatStore } from '@/store/chat';

export default {
  components: {
    JoinChatroomDialog
  },
  emits: ['join'],
  computed: {
    ...mapStores(useChatStore)
  },
  methods: {
    join(id) {
      this.$emit('join', id);
    },
    pushChatroom(chatroom) {
      this.chatStore.addRoom(chatroom);
      this.join(chatroom.id);
    }
  }
};
</script>

<style scoped>
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
  background-color: var(--light) !important;
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
