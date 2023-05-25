<template>
  <v-table class="friends" density="compact">
    <thead>
      <h3>My friends</h3>
      <tr>
        <th class="text-left">Nickname</th>
        <th class="text-left">Ladder points</th>
        <th class="text-left">Avatar</th>
        <th class="text-left"></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="friend in friends" :key="friend.nickname">
        <td>{{ friend.nickname }}</td>
        <td>{{ friend.ladderPoints }}</td>
        <td>
          <img :src="friend.avatarPath" alt="avatar" width="50" height="50" />
        </td>
        <td class=" hgt-td">
          <IsFriend :friendname="friend.nickname" @delete="deleteFriend(friend.nickname)" ></IsFriend>
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

export default {
  components: {
    IsFriend
  },
  data() {
    return {
      friends: [],
      newFriend: '',
      renderPage: 0
    };
  },
  computed: {
    ...mapStores(useSessionStore)
  },
  watch: {
    async renderPage() {
      await this.getFriends();
    }
  },
  async mounted() {
    await this.getFriends();
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
    }
  }
};
</script>

<style lang="scss" scoped>
.friends{
  padding-top: 12px;
  background-color: var(--dark-purple);
  border-style: solid;
  border-radius: 5px;
  box-shadow: 5px 5px 5px var(--light-purple);
  border-color: var(--light-purple);
}

</style>
