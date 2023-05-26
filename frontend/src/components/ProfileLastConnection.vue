<template>
  <div v-if="!isLog">
    <v-row class="justify-center"
      ><h4 class="font">Disconnect since :</h4></v-row
    >
    <v-row class="justify-center"
      ><p class="font">{{ disconnectSince }}</p></v-row
    >
  </div>
  <div v-else>
    <v-row class="justify-center"><h4 class="font">Online</h4></v-row>
  </div>
</template>

<script>
import axios from 'axios';
import * as constants from '@/constants.ts';
import swal from 'sweetalert';
import formatError from '@/utils/lib';
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
      const lastCoUTC = new Date(this.user.lastConnection).getTime();
      this.disconnectSince = new Date(lastCoUTC).toLocaleString();
    }
  }
};
</script>

<style>
.font {
  font-family: 'Poppins', serif;
}
</style>
