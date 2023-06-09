<template>
  <v-btn
    v-if="getStatusFriend(friendname) && !hover && !isMyProfile(friendname)"
    color="#600FDF"
    size="x-small"
    icon
    @mouseenter="hover = true"
    ><img src="/assets/icons/add-friend.png" :width="20" :height="20"
  /></v-btn>
  <v-btn
    v-if="hover && getStatusFriend(friendname) && !isMyProfile(friendname)"
    color="#0F0124"
    size="x-small"
    icon
   @mouseleave="hover = false"
   @click="deleteFriend(friendname)"
    ><img src="/assets/icons/trash.png" :width="20" :height="20"
  /></v-btn>
  <v-btn
    v-if="!getStatusFriend(friendname) && !isMyProfile(friendname)"
    color="#0F0124"
    size="x-small"
    icon
    @click="addFriend(friendname)"
    ><img src="/assets/icons/add-user.png" :width="20" :height="20"
  /></v-btn>
</template>

<script>
import { mapStores } from 'pinia';
import axios from 'axios';
import { useSessionStore } from '@/store/session';
import * as constants from '@/constants.ts';
import formatError from '@/utils/lib';
import swall from 'sweetalert';

export default {
  props: ['friendname'],
  emits: ['delete'],
  data() {
    return {
      users: [],
      friends: [],
      hover: false
    };
  },
  computed: {
    ...mapStores(useSessionStore)
  },
  watch: {
    friends() {
      this.getFriends();
    }
  },
  async mounted() {
    await this.getFriends();
  },
  methods: {
    async getFriends() {
      try {
        const response = await axios.get(
          constants.API_URL + `/users/${this.sessionStore.nickname}/friends`
        );
        this.friends = response.data.map((friend) => friend.nickname);
      } catch (error) {
        console.log('error');
      }
    },
    async deleteFriend(nickname) {
      try {
        await axios.delete(
          constants.API_URL +
            `/users/${this.sessionStore.nickname}/friends/${nickname}`
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
    async addFriend(friendname) {
      try {
        await axios.post(
          constants.API_URL +
            `/users/${this.sessionStore.nickname}/friends/${friendname}`
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
    getStatusFriend(friendname) {
      return this.friends.includes(friendname);
    },
    isMyProfile(friendname) {
      return friendname == this.sessionStore.nickname;
    }
  }
};
</script>