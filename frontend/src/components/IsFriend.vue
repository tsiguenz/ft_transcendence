<template>
    <v-btn
        v-if="getStatusFriend(friendname) && !hover"
        color="#600FDF"
    size="x-small" icon @mouseenter="hover = true"><img src="../../assets/icons/add-friend.png" :width='20' :height='20' /></v-btn>
    <v-btn v-if="hover && getStatusFriend(friendname)" color="#0F0124" size="x-small" icon @mouseleave="hover = false" @click="deleteFriend(friendname)"><img src="../../assets/icons/supprimer.png" :width='20' :height='20' /></v-btn>
    <v-btn v-if="!getStatusFriend(friendname)" color="#0F0124" size="x-small" icon  @click="addFriend(friendname)"><img src="../../assets/icons/add-user.png" :width='20' :height='20' /></v-btn>
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
  data() {
    return {
      users: [],
        friends: [],
        hover: false,
    };
  },
    computed: {
        ...mapStores(useSessionStore)
    },
    watch:{
        friends(){
            this.getFriends();
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
            constants.API_URL +
            `/users/${this.sessionStore.nickname}/friends`,
            {
            headers: {
                Authorization: 'Bearer ' + jwt
            } 
            }
        );
        this.friends = response.data.map(friend => friend.nickname);
        } catch(error) {
        console.log("error");
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
    async addFriend(friendname) {
      try {
        const jwt = this.$cookie.getCookie('jwt');
        await axios.post(
          constants.API_URL +
            `/users/${this.sessionStore.nickname}/friends/${friendname}`,
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
    getStatusFriend(friendname){
        return this.friends.includes(friendname);
    }
}
};
</script>
