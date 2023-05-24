<template>
	<div v-if="!isLog">
  <v-row class="justify-center"
    ><h4 class="font">{{ disconnectSince }}</h4></v-row
  >
  <v-row class="justify-center"><p>Last connection</p></v-row>
	</div>
	<div v-else>
  <v-row class="justify-center"
    ><h4 class="font">Online</h4></v-row
  >
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
  props: ['lastConnection'],
  data() {
    return {
			isLog: false,
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
      if (this.sessionStore.loggedIn) {
				this.isLog = true;
        return;
      }
				this.isLog = false;
      const lastCoUTC = new Date(this.lastConnection).getTime();
      const nowUTC = new Date().getTime();
      this.disconnectSince = new Date(nowUTC - lastCoUTC)
        .toISOString()
        .slice(11, 19);
    },
  }
};
</script>

<style>
.font {
  font-family: 'Poppins', serif;
}
</style>
