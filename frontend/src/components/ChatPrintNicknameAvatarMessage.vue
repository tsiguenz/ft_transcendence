<template>
  <div v-if="isMounted">
    <p class="[ isSender ? nameMe : nameOther ]">{{ currentUserNickname }}</p>
    <span class="text-right my-2 ml-2 msgOther">
      <p v-if="isSender" class="bubble pa-1 bg-blue msg-content">
        {{ message }}
      </p>
      <ProfileClick
        :nickname="currentUserNickname"
        :status="userStatus(currentUser)"
        :width="40"
        :height="40"
        :url-avatar="currentUserAvatar"
      ></ProfileClick>
      <p v-if="!isSender" class="bubble pa-1 bg-green msg-content">
        {{ message }}
      </p>
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
  inject: ['connectedUsersStore'],
  data() {
    return {
      currentUser: [],
      currentUserNickname: '',
      currentUserAvatar: '',
      currentMessage: '',
      isSender: false,
      connectedUsers: this.connectedUsersStore.connectedUsers,
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
    },
    userStatus(user) {
      if (this.connectedUsers.includes(user.id)) {
        return true;
      }
      return false;
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

.nameMe {
  padding-right: 15px;
  font-size: 10px;
}
</style>
