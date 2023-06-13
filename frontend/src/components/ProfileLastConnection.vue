<template>
  <div v-if="!isLog">
    <h4 class="font">Disconnect since :</h4>
    <p class="font">{{ disconnectSince }}</p>
  </div>
  <div v-else>
    <h4 class="font">Online</h4>
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
      connectedUsers: this.connectedUsersStore.connectedUsers
    };
  },
  computed: {
    ...mapStores(useSessionStore)
  },
  mounted() {
    this.calculateDifference();
  },
  methods: {
    calculateDifference() {
      if (this.connectedUsers.includes(this.user.id)) {
        this.isLog = true;
        return;
      }
      this.isLog = false;
      this.disconnectSince = lib.convertDate(this.user.lastConnection);
    }
  }
};
</script>

<style>
.font {
  font-family: 'Poppins', serif;
}
</style>
