<template>
  <v-row class="align-center">
    <div class="mt-3">
      <ProfileClick
        :nickname="opponent.nickname"
        :user-id="opponent.id"
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
import * as constants from '@/constants.ts';
import ProfileClick from './ProfileClick.vue';

export default {
  components: {
    ProfileClick
  },
  props: ['opponent'],
  data() {
    return {};
  },
  methods: {
    getAvatarPath(user) {
      return constants.AVATARS_URL + user.avatarPath;
    }
  }
};
</script>

<style>
.font {
  font-family: 'Poppins', serif;
}
</style>
