<template>
  <h1>Friends</h1>
  <v-sheet width="100%">
    <v-row>
      <v-col cols="12" md="4">
        <v-form @submit.prevent>
          <v-text-field
            v-model="newFriend"
            label="Friend's nickname"
            block
          ></v-text-field>
        </v-form>
      </v-col>
      <v-col cols="12" md="4">
        <v-btn type="submit" block class="mt-2" @click="addFriend(newFriend)"
          >Add as friend</v-btn
        >
      </v-col>
    </v-row>
  </v-sheet>
  <v-table density="compact">
    <thead>
      <tr>
        <th class="text-left">Nickname</th>
        <th class="text-left"></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="friend in friends" :key="friend">
        <td>{{ friend }}</td>
        <td>
          <v-btn size="small" @click="deleteFriend(friend)"
            >Delete friend</v-btn
          >
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

export default {
  data() {
    return {
      friends: [],
      newFriend: ''
    };
  },
  computed: {
    ...mapStores(useSessionStore)
  },
  watch: {
    async friends() {
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
      } catch (error) {
        console.log(error);
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
