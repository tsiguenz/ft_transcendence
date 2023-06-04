<template>
  <v-btn
    v-if="isMyFriend && !hover && !isMyProfile()"
    color="#600FDF"
    size="x-small"
    icon
    @mouseenter="hover = true"
    ><img src="/assets/icons/add-friend.png" :width="20" :height="20"
  /></v-btn>
  <v-btn
    v-if="hover && isMyFriend && !isMyProfile()"
    color="#0F0124"
    size="x-small"
    icon
    @mouseleave="hover = false"
    @click="deleteFriend(friendname)"
    ><img src="/assets/icons/trash.png" :width="20" :height="20"
  /></v-btn>
  <v-btn
    v-if="!isMyFriend && !isMyProfile()"
    color="#0F0124"
    size="x-small"
    icon
    @click="addFriend()"
    ><img src="/assets/icons/add-user.png" :width="20" :height="20"
  /></v-btn>
</template>

<script>
import axios from 'axios';
import * as constants from '@/constants.ts';
import formatError from '@/utils/lib';
import swall from 'sweetalert';

export default {
  inject: ['sessionStore'],
  props: {
    friendname: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      isMyFriend: false,
      hover: false
    };
  },
  mounted() {
    this.setStatusFriend();
  },
  methods: {
    async setStatusFriend() {
      const response = await axios
        .get(constants.API_URL + `/users/${this.sessionStore.nickname}/friends`)
        .catch((error) => {
          console.log(error);
        });
      const friends = response.data.map((friend) => friend.nickname);
      this.isMyFriend = !!friends.includes(this.friendname);
    },
    async deleteFriend() {
      await axios
        .delete(
          constants.API_URL +
            `/users/${this.sessionStore.nickname}/friends/${this.friendname}`
        )
        .catch((error) => {
          swall({
            title: 'Error',
            text: formatError(error.response.data.message),
            icon: 'error',
            button: 'OK'
          });
        });
      this.isMyFriend = false;
    },
    async addFriend() {
      await axios
        .post(
          constants.API_URL +
            `/users/${this.sessionStore.nickname}/friends/${this.friendname}`
        )
        .catch((error) => {
          swall({
            title: 'Error',
            text: formatError(error.response.data.message),
            icon: 'error',
            button: 'OK'
          });
        });
      this.isMyFriend = true;
    },
    isMyProfile() {
      return this.friendname == this.sessionStore.nickname;
    }
  }
};
</script>
