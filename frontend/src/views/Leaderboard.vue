<template>
  <h1 class="title">Leaderboard</h1>
  <br />
  <div v-if="leaders">
    <Ranking :users="leaders" />
  </div>
  <v-table density="compact">
    <thead>
      <tr class="cust-tr">
        <th class="cust-th"></th>
        <th class="cust-th">Nickname</th>
        <th class="cust-th">Ladder points</th>
        <th class="cust-th"></th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(user, index) in users"
        :key="user.id"
        :class="{ isprofile: isMyProfile(user.nickname) }"
      >
        <td class="indexRank">{{ index + 1 }}</td>
        <td class="cust-td hgt-td">
          <ProfileClick
            :nickname="user.nickname"
            :status="userStatus(user)"
            :width="40"
            :height="40"
            :url-avatar="getAvatarPath(user)"
          ></ProfileClick>
          <p>{{ user.nickname }}</p>
        </td>
        <td class="hgt-td">{{ user.ladderPoints }}</td>
        <td class="hgt-td">
          <IsFriend
            v-if="!isMyProfile(user.nickname)"
            :friendname="user.nickname"
            :is-friend-at-begining="isFriend(user.nickname)"
          ></IsFriend>
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
import * as lib from '@/utils/lib';
import swall from 'sweetalert';

export default {
  components: {
    ProfileClick,
    IsFriend,
    Ranking
  },
  inject: ['connectedUsersStore', 'sessionStore', 'friendStore'],
  data() {
    return {
      friends: this.friendStore.friends,
      users: [],
      connectedUsers: this.connectedUsersStore.connectedUsers
    };
  },
  computed: {
    leaders() {
      if (this.users.length > 0) {
        return {
          first: this.users[0],
          second: this.users[1],
          third: this.users[2]
        };
      }
      return 0;
    }
  },
  watch: {
    connectedUsersStore: {
      handler() {
        this.connectedUsers = this.connectedUsersStore.connectedUsers;
      },
      deep: true
    },
    friendStore: {
      handler() {
        this.friends = this.friendStore.friends;
      },
      deep: true
    }
  },
  async created() {
    await this.getUsers();
    this.friendStore.setFriends(this.sessionStore.nickname)
  },
  methods: {
    async getUsers() {
      try {
        const response = await axios.get(constants.API_URL + '/users');
        this.users = response.data;
      } catch (error) {
        swall({
          title: 'Error',
          text: lib.formatError(error.response.data.message),
          icon: 'error',
          button: 'OK'
        });
        this.$router.push('/logout');
      }
    },
    userStatus(user) {
      if (this.connectedUsers.includes(user.id)) {
        return true;
      }
      return false;
    },
    getLeaders() {
      return {
        first: this.users[0],
        second: this.users[1],
        third: this.users[2]
      };
    },
    getAvatarPath(user) {
      return constants.AVATARS_URL + user.avatarPath;
    },
    isFriend(nickname) {
      return this.friends.includes(nickname);
    },
    isMyProfile(name) {
      return name === this.sessionStore.nickname;
    }
  }
};
</script>

<style lang="scss" scoped>
.v-table {
  background: var(--medium-purple);
  width: 95%;
  margin-right: auto;
  margin-left: auto;
  border-style: solid;
  border-radius: 5px;
  box-shadow: 5px 5px 5px var(--light-purple);
  border-color: var(--light-purple);
}

tr:not(.isprofile) {
  background-color: var(--dark-purple);
}

.cust-th {
  color: #ffff !important;
  text-transform: uppercase;
}

.hgt-td {
  height: 60px !important;
}

.cust-td {
  display: flex !important;
  padding: 1rem;
  p {
    margin-top: auto;
    margin-bottom: auto;
    margin-left: 10px;
  }
}

.cont {
  margin-top: auto;
  margin-bottom: auto;
}

.title {
  color: #ffff;
  text-align: center;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.indexRank {
  color: #ffff;
  font-size: 1.5rem;
  font-weight: bold;
  width: 5%;
}
</style>
