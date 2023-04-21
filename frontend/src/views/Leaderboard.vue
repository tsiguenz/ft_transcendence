<template>
  <h1>Leaderboard</h1>
  <br />
  <v-table density="compact">
    <thead>
      <tr>
        <th class="text-left">Nickname</th>
        <th class="text-left">Ladder points</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="user in users" :key="user.nickname">
        <td>{{ user.nickname }}</td>
        <td>{{ user.ladderPoints }}</td>
        <td>
          <v-btn size="small" @click="addFriend(user.nickname)"
            >Add friend</v-btn
          >
        </td>
      </tr>
    </tbody>
  </v-table>
</template>

<script>
import { mapStores } from 'pinia';
import { useSessionStore } from '@/store/session';
import axios from 'axios';
import * as constants from '@/constants.ts';
import formatError from '@/utils/lib';
import swall from 'sweetalert';

export default {
  data() {
    return {
      users: []
    };
  },
  computed: {
    ...mapStores(useSessionStore)
  },
  async mounted() {
    await this.getUsers();
  },
  methods: {
    async getUsers() {
      try {
        const jwt = this.$cookie.getCookie('jwt');
        const response = await axios.get(constants.API_URL + '/users', {
          headers: {
            Authorization: 'Bearer ' + jwt
          }
        });
        this.users = response.data;
      } catch (error) {
        // TODO: Handle error
        swall({
          title: 'Error',
          text: formatError(error.response.data.message),
          icon: 'error',
          button: 'OK'
        });
        this.$router.push('/logout');
      }
    },
    async addFriend(friend) {
      try {
        const jwt = this.$cookie.getCookie('jwt');
        await axios.post(
          constants.API_URL +
            `/users/${this.sessionStore.nickname}/friends/${friend}`,
          {},
          {
            headers: {
              Authorization: 'Bearer ' + jwt
            }
          }
        );
      } catch (error) {
        swall({
          title: 'Error',
          text: formatError(error.response.data.message),
          icon: 'error',
          button: 'OK'
        });
      }
    }
  }
};
</script>
