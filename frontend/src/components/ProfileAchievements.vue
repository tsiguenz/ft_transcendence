<template>
  <div class="font">
    <h2>Achievements</h2>
    <div v-for="(title, description) in achievements.titles">
      <v-divider />
      <ul>
        <h4>{{ title }}</h4>
      </ul>
      <ul>
        {{
          achievements.descriptions[description]
        }}
      </ul>
    </div>
  </div>
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
    await this.putAchievements();
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
    },
    async putAchievements() {
      this.achievements = {
        titles: [
          'Super Player',
          'Amazing player',
          'We have a winner',
          'Decade Dominator',
          'Decimation Demolisher'
        ],
        descriptions: [
          'Played 1 game',
          'Played 10 games',
          'Won 1 game',
          'Won 10 games',
          'Won 100 games'
        ]
      };
    }
  }
};
</script>

<style>
.font {
  font-family: 'Poppins', serif;
}
</style>
