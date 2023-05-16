<template>
  <h1>Leaderboard</h1>
  <br />
  <Ranking :users="getLeaders()"/>
  <v-table density="compact">
    <thead>
      <tr class="cust-tr">
        <!-- <th class="cust-th">Id</th> -->
        <th class="cust-th">Nickname</th>
        <th class="cust-th">Ladder points</th>
        <th class="cust-th">Status</th>
        <th class="cust-th"></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="user in users" :key="user.id">
        <!-- <td>{{ user.id }}</td> -->
        <td class="cust-td hgt-td"> <ProfileClick :nickname="user.nickname" :status="userStatus(user)" :width="40" :height="40"></ProfileClick><p>{{ user.nickname }}</p></td>
        <td class=" hgt-td">{{ user.ladderPoints }}</td>
        <td class=" hgt-td">{{ userStatus(user) }}</td>
        <td class=" hgt-td">
          <IsFriend :friendname="user.nickname"></IsFriend>
        </td>
      </tr>
    </tbody>
  </v-table>
</template>

<script>
import ProfileClick from '../components/ProfileClick.vue';
import IsFriend from '../components/IsFriend.vue';
import Ranking from '../components/Ranking.vue';
import axios from 'axios';
import * as constants from '@/constants.ts';
import formatError from '@/utils/lib';
import swall from 'sweetalert';

export default {
  components: {
    ProfileClick,
    IsFriend,
    Ranking
  },
  inject: ['connectedUsersStore', 'sessionStore'],
  data() {
    return {
      users: [],
      connectedUsers: this.connectedUsersStore.connectedUsers
    };
  },
  watch: {
    connectedUsersStore: {
      handler() {
        this.connectedUsers = this.connectedUsersStore.connectedUsers;
      },
      deep: true
    }
  },
  created() {
    console.log('leaderboard is created')
    
  },
  async abeforeMount() {
    console.log('leaderboard before mount')
    await this.getUsers();
  },
  mounted() {
    console.log('leaderboard is mouted')
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
    },
    userStatus(user) {
      return this.connectedUsers.includes(user.id)
        ? 'Connected'
        : 'Disconnected';
    },
    getLeaders() {
      console.log('in gettop3', this.users);
      return { first: this.users[0], second: this.users[1], third: this.users[2] };
    }
  },
};
</script>


<style lang="scss" scoped>

.v-table{
  background: var(--medium-purple);
  width: 95%;
  margin-right: auto;
  margin-left: auto;
  border-style: solid;
  border-radius: 5px;
  box-shadow: 5px 5px 5px var(--light-purple);
  border-color: var(--light-purple);
}

.cust-th{
  color: #ffff !important;
  text-transform: uppercase;
}

.hgt-td{
  height: 60px !important;
}

.cust-td{
  display: flex !important;
  padding: 1rem;
  p{
    margin-top: auto;
    margin-bottom: auto;
    margin-left: 10px;
  }
}

.cont{
  margin-top: auto;
  margin-bottom: auto;
}

</style>