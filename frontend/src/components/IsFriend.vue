<template>
  <v-btn
    v-if="newFriendStatus && !hover"
    color="#600FDF"
    size="x-small"
    icon
    @mouseenter="hover = true"
    ><img src="/assets/icons/add-friend.png" :width="20" :height="20"
  /></v-btn>
  <v-btn
    v-if="hover && newFriendStatus"
    color="#0F0124"
    size="x-small"
    icon
    @mouseleave="hover = false"
    @click="deleteFriend(friendname)"
    ><img src="/assets/icons/trash.png" :width="20" :height="20"
  /></v-btn>
  <v-btn
    v-if="!newFriendStatus"
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
import * as lib from '@/utils/lib';
import swall from 'sweetalert';

export default {
  inject: ['sessionStore'],
  props: {
    friendname: {
      type: String,
      required: true
    },
    isFriendAtBegining: {
      type: Boolean,
      required: true
    }
  },
  emits: ['refresh-friends'],
  data() {
    return {
      newFriendStatus: false,
      hover: false
    };
  },
  watch: {
    isFriendAtBegining: {
      handler() {
        this.newFriendStatus = this.isFriendAtBegining;
      }
    }
  },
  mounted() {
    this.newFriendStatus = this.isFriendAtBegining;
  },
  methods: {
    async deleteFriend() {
      await axios
        .delete(
          constants.API_URL +
            `/users/${this.sessionStore.nickname}/friends/${this.friendname}`
        )
        .catch((error) => {
          swall({
            title: 'Error',
            text: lib.formatError(error.response.data.message),
            icon: 'error',
            button: 'OK'
          });
        })
        .then(() => {
          this.newFriendStatus = false;
          this.$emit('refresh-friends');
        });
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
            text: lib.formatError(error.response.data.message),
            icon: 'error',
            button: 'OK'
          });
        })
        .then(() => {
          this.newFriendStatus = true;
          this.$emit('refresh-friends');
        });
    }
  }
};
</script>
