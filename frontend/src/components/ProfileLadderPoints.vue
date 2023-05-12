<template>
  <v-container flex class="font">
    <v-row justify="center">
      <h1>{{ user.ladderPoints }}</h1>
    </v-row>
    <v-row justify="center">
      <h3>Ladder Points</h3>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios';
import * as constants from '@/constants.ts';
import swal from 'sweetalert';
import formatError from '@/utils/lib';
import { mapStores } from 'pinia';
import { useSessionStore } from '@/store/session';
import ProfilePrintAvatar from '../components/ProfilePrintAvatar.vue';

export default {
  data() {
    return {
      user: {},
      achievements: [],
      test: []
    };
  },
  computed: {
    ...mapStores(useSessionStore)
  },
  async mounted() {
    await this.getProfile();
  },
  methods: {
    async getProfile() {
      try {
        const response = await axios.get(constants.API_URL + '/profile');
        this.user = response.data;
      } catch (error) {
        swal({
          icon: 'error',
          text: formatError(error.response.data.message)
        });
        this.$router.push('/logout');
      }
    }
  }
};
</script>

<style>
.font {
  font-family: 'Poppins', serif;
}
</style>
