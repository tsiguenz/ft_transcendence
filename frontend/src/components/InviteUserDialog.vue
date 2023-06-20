<template>
  <v-dialog v-model="dialog" width="1024">
    <template v-slot:activator="{ props }">
      <v-btn class="addbtn" v-bind="props" block> Invite users </v-btn>
    </template>
    <v-card class="window">
      <v-card-title>
        <span class="text-h5">Invite user</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="4">
              <SearchProfile @user-selected="setSelectedUser" />
            </v-col>
            <v-col cols="8">
              Selected user: <span v-if="selectedUser">{{ selectedUser.nickname }}</span>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue-darken-1" variant="text" @click="closeDialog">
          Close
        </v-btn>
        <v-btn color="blue-darken-1" variant="text" @click="inviteUser">
          Invite
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

</template>

<script>
import SearchProfile from './SearchProfile.vue';
import { mapStores } from 'pinia';
import { useSessionStore } from '@/store/session';
import ChatService from '../services/chat.service';

export default {
  components: {
    SearchProfile
  },
  data() {
    return {
      selectedUser: undefined,
      dialog: false
    };
  },
  props: ['id'],
  computed: {
  },
  methods: {
    setSelectedUser(user) {
      this.selectedUser = user;
    },
    closeDialog() {
      this.dialog = false;
      this.selectedUser = undefined;
    },
    inviteUser() {
      if (this.selectedUser) {
        ChatService.inviteUser(this.id, this.selectedUser.id);
        this.closeDialog();
      }
    }
  }
};
</script>

<style scoped>
.addbtn {
  background-color: var(--medium-purple) !important;
}
</style>