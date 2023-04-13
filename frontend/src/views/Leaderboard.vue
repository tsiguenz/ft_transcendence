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
      </tr>
    </tbody>
  </v-table>
</template>

<script>
import axios from 'axios';
import * as constants from '@/constants.ts';

export default {
  data() {
    return {
      users: []
    };
  },

  async created() {
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
      console.log(error);
      this.$router.push('/logout');
    }
  }
};
</script>
