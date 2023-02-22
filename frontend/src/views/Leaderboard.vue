<template>
  <h1>LadderBoard</h1>
  <br />
  <v-table density="compact">
    <thead>
      <tr>
        <th class="text-left">Id</th>
        <th class="text-left">Nickname</th>
        <th class="text-left">Ladder points</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="user in users" :key="user.id">
        <td>{{ user.id }}</td>
        <td>{{ user.nickname }}</td>
        <td>{{ user.ladderPoints }}</td>
      </tr>
    </tbody>
  </v-table>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      users: []
    };
  },

  async created() {
    try {
      const response = await axios.get(
        'http://localhost:3000/api/auth/get-all-users'
      );
      this.users = response.data;
    } catch (error) {
      console.log(error);
    }
  }
};
</script>
