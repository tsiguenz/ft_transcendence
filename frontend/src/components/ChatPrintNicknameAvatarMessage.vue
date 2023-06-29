<template>
  <div v-if="isMounted">
    <p class="[ isSender ? nameMe : nameOther ]">{{ currentUserNickname }}</p>
    <span class="my-2 ml-2 msg">
      <p v-if="isSender" class="bubble pa-1 bg-blue msg-content">
        {{ message }}
      </p>
      <ProfileClick
        :nickname="currentUserNickname"
        :user-id="userId"
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
import * as lib from '@/utils/lib';
import axios from 'axios';

export default {
  components: {
    ProfileClick
  },
  props: ['userId', 'message', 'senderIsCurrentUser'],
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
    async getCurrentUser() {
      try {
        const responseUsers = await axios.get(constants.API_URL + '/users');
        this.users = responseUsers.data;
      } catch (error) {
        this.$router.push('/logout');
        return;
      }
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
.msg {
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

.msg-content {
  max-width: 300px;
  word-wrap: break-word;
  text-align: left;
}
</style>
