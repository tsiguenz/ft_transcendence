<template>
  <v-row class="justify-center"
    ><h4 class="font">{{ disconnectSince }}</h4></v-row
  >
  <v-row class="justify-center"><p>Last connection</p></v-row>
</template>

<script>
import axios from 'axios';
import * as constants from '@/constants.ts';
import swal from 'sweetalert';
import formatError from '@/utils/lib';
import { mapStores } from 'pinia';
import { useSessionStore } from '@/store/session';
export default {
  props: ['lastConnection'],
  data() {
    return {
      disconnectSince: ''
    };
  },
  computed: {
    ...mapStores(useSessionStore)
  },
  mounted() {
    this.calculateDifference();
    this.interval = setInterval(this.calculateDifference.bind(this), 1000);
  },
  unmounted() {
    clearInterval(this.interval);
  },
  methods: {
    calculateDifference() {
      if (!this.sessionStore.loggedIn) {
        return;
      }
      const lastCoUTC = new Date(this.lastConnection).getTime();
      const nowUTC = new Date().getTime();
      this.disconnectSince = new Date(nowUTC - lastCoUTC)
        .toISOString()
        .slice(11, 19);
    }
  }
};
</script>

<style>
.font {
  font-family: 'Poppins', serif;
}
</style>
