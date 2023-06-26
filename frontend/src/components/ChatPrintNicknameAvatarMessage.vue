<template>
  <div v-if="isMounted">
    <p class="nameOther">{{ currentUserNickname }}</p>
    <span class="text-left ma-2 msgOther">
      <ProfileClick
        :nickname="currentUserNickname"
        :status="false"
        :width="40"
        :height="40"
        :url-avatar="currentUserAvatar"
      ></ProfileClick>
      <p v-if="!isSender" class="bubble pa-1 bg-green msg-content">
        {{ message }}
      </p>
      <p v-else class="bubble pa-1 bg-blue msg-content">{{ message }}</p>
    </span>
  </div>
</template>

<script>
import * as constants from '@/constants.ts';
import ProfileClick from '../components/ProfileClick.vue';

export default {
  components: {
    ProfileClick
  },
  props: ['userId', 'users', 'message', 'senderIsCurrentUser'],
  data() {
    return {
      currentUser: [],
      currentUserNickname: '',
      currentUserAvatar: '',
      currentMessage: '',
      isSender: false,
      isMounted: false
    };
  },
  mounted() {
    this.getCurrentUser();
  },
  methods: {
    getCurrentUser() {
      this.currentUser = this.users.filter(
        (currentUser) => currentUser.id == this.userId
      )[0];
      this.currentUserNickname = this.currentUser.nickname;
      this.currentUserAvatar =
        constants.AVATARS_URL + this.currentUser.avatarPath;
      this.currentMessage = this.message;
      this.isSender = this.senderIsCurrentUser;
      this.isMounted = true;
    }
  }
};
</script>

<style scoped>
.msgOther {
  display: flex;
  gap: 10px;
}

.bubble {
  border-radius: 5px;
}

.nameOther {
  padding-left: 10px;
  font-size: 10px;
}
</style>
