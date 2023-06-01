<template>
            <v-table  v-if="friends.length === 0" class="friends" density="compact">
              <h2>Friends</h2>
              <v-col col="10">
                <v-list-item-content class="noroom">
                  <h3> :( </h3>
                  <h3> Oops nothing here </h3>
                </v-list-item-content>
              </v-col>
            </v-table>
  <v-table v-else class="friends" density="compact">
    <thead>
      <tr class="cust-tr">
        <th class="cust-th">Nickname</th>
        <th class="cust-th">Ladder points</th>
        <th class="cust-th"></th>
      </tr>
    </thead>
    <tbody>
      <tr  v-for="friend in friends" :key="friend.id">
        <td class="cust-td hgt-td"> <ProfileClick :nickname="friend.nickname" :status="userStatus(friend)" :width="40" :height="40" :url-avatar="getAvatarPath(friend)"></ProfileClick><p>{{ friend.nickname }}</p></td>
        <td class=" hgt-td">{{ friend.ladderPoints }}</td>
        <td class=" hgt-td">
          <IsFriend :friendname="friend.nickname" @delete="deleteFriend(friend.nickname)"></IsFriend>
        </td>
      </tr>
    </tbody>
  </v-table>
</template>

<script>
import { mapStores } from 'pinia';
import { useSessionStore } from '@/store/session';
import * as constants from '@/constants.ts';
import axios from 'axios';
import swall from 'sweetalert';
import formatError from '@/utils/lib';
import IsFriend from '../components/IsFriend.vue';
import ProfileClick from '../components/ProfileClick.vue';

export default {
  components: {
    IsFriend,
    ProfileClick
  },
  inject: ['connectedUsersStore', 'sessionStore'],
  data() {
    return {
      friends: [],
      newFriend: '',
      renderPage: 0,
      connectedUsers: this.connectedUsersStore.connectedUsers,
      connectedFriends: []

    };
  },
  computed: {
    ...mapStores(useSessionStore)
  },
  watch: {
    async renderPage() {
      await this.getFriends();
    },
    connectedUsersStore: {
      handler() {
        this.connectedUsers = this.connectedUsersStore.connectedUsers;
      },
      deep: true
    }
  },
  async mounted() {
    await this.getFriends();
    this.getConnectedFriends();
  },
  methods: {
    async getFriends() {
      try {
        const jwt = this.$cookie.getCookie('jwt');
        const response = await axios.get(
          constants.API_URL + `/users/${this.sessionStore.nickname}/friends`,
          {
            headers: {
              Authorization: 'Bearer ' + jwt
            }
          }
        );
        this.friends = response.data;
        this.friends.forEach((friend) => {
          friend.avatarPath = constants.AVATARS_URL + friend.avatarPath;
        });
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
    async deleteFriend(nickname) {
      try {
        const jwt = this.$cookie.getCookie('jwt');
        await axios.delete(
          constants.API_URL +
            `/users/${this.sessionStore.nickname}/friends/${nickname}`,
          {
            headers: {
              Authorization: 'Bearer ' + jwt
            }
          }
        );
        this.renderPage++;
      } catch (error) {
        swall({
          title: 'Error',
          text: formatError(error.response.data.message),
          icon: 'error',
          button: 'OK'
        });
      }
    },
    async addFriend(nickname) {
      try {
        const jwt = this.$cookie.getCookie('jwt');
        await axios.post(
          constants.API_URL +
            `/users/${this.sessionStore.nickname}/friends/${nickname}`,
          {},
          {
            headers: {
              Authorization: 'Bearer ' + jwt
            }
          }
        );
        this.renderPage++;
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
      if (this.connectedUsers.includes(user.id)){
        return true;
      }
      return false;
    },
    getConnectedFriends() {
        this.connectedFriends = [];
        for (let i = 0; i < this.friends.length; i++) {
            if (this.connectedUsers.includes(this.friends[i].id)) {
                this.connectedFriends.push(this.friends[i]);
        }
    }
  },
  getAvatarPath(user) {
    return user.avatarPath;
  },
  }
};
</script>

<style lang="scss" scoped>
.friends{
  padding-top: 12px;
  text-align: center;
  background-color: var(--dark-purple);
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

</style>
