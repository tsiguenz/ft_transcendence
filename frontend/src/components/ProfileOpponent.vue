<template>
 <v-row class="align-center">
		<div class="mt-3">
          <ProfileClick
            :nickname="opponent.nickname"
            :status="userStatus(opponent)"
            :width="40"
            :height="40"
            :url-avatar="getAvatarPath(opponent)"
          ></ProfileClick>
		</div>
		<div class="mt-3">
					{{ opponent.nickname }}
		</div>
 </v-row>
</template>

<script>
import axios from 'axios';
import * as constants from '@/constants.ts';
import * as lib from '@/utils/lib';
import ProfileClick from './ProfileClick.vue';

export default {
  props: ['opponent'],
	components: {
    ProfileClick,
	},
  inject: ['connectedUsersStore'],
  data() {
    return {
      connectedUsers: this.connectedUsersStore.connectedUsers
		};
  },
  methods: {
    userStatus(user) {
      if (this.connectedUsers.includes(user.id)) {
        return true;
      }
      return false;
    },
    getAvatarPath(user) {
      return constants.AVATARS_URL + user.avatarPath;
    },
  }
};
</script>

<style>
.font {
  font-family: 'Poppins', serif;
}
</style>
