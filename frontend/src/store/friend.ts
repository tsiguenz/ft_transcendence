import { defineStore } from 'pinia';
import * as constants from '@/constants.ts';
import axios from 'axios';
import swall from 'sweetalert';
import * as lib from '@/utils/lib';

export const useFriendStore = defineStore('friend', {
  state() {
    return {
      friends: []
    };
  },
  getters: {},
  actions: {
    async setFriends(username: string) {
      try {
        const response = await axios.get(
          constants.API_URL + `/users/${username}/friends`
        );
        this.friends = response.data;
        this.friends.forEach((friend) => {
          friend.avatarPath = constants.AVATARS_URL + friend.avatarPath;
        });
      } catch (error) {
        swall({
          title: 'Error',
          text: lib.formatError(error.response.data.message),
          icon: 'error',
          button: 'OK'
        });
      }
    }
  }
});
