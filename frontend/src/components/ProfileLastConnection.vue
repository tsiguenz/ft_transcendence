<template>
  <div class="profileLastConnectionText">
    <div v-if="!isLog">
      <h4 class="font">Disconnect since :</h4>
      <p class="font">{{ disconnectSince }}</p>
    </div>
    <div v-else>
      <h4 class="font">Online</h4>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import * as constants from '@/constants.ts';
import * as lib from '@/utils/lib';
import { mapStores } from 'pinia';
import { useSessionStore } from '@/store/session';
export default {
  props: ['user'],
  inject: ['connectedUsersStore'],
  data() {
    return {
      isLog: false,
      disconnectSince: '',
      connectedUsers: this.connectedUsersStore.connectedUsers,
      currentUser: []
    };
  },
  computed: {
    ...mapStores(useSessionStore)
  },
  watch: {
    connectedUsersStore: {
      handler() {
        this.connectedUsers = this.connectedUsersStore.connectedUsers;
        this.isLog = this.connectedUsers.includes(this.user.id);
      },
      deep: true
    },
    user() {
      if (this.currentUser != this.user) this.calculateDifference();
    }
  },
  mounted() {
    this.calculateDifference();
  },
  methods: {
    calculateDifference() {
      this.currentUser = this.user;
      this.disconnectSince = lib.convertDate(this.user.lastConnection);
      this.isLog = this.connectedUsers.includes(this.user.id);
    }
  }
};
</script>

<style>
.profileLastConnectionText {
  font-family: 'Poppins', serif;
  text-align: center;
  line-height: 3vh;
}
</style>
