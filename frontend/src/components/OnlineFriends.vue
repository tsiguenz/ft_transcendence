<template>
  <v-list>
    <v-list-subheader>Connected Friends</v-list-subheader>
    <div class="online-btn">
      <tbody>
        <tr v-for="user in connectedFriends" :key="user.id">
          <td class="connected">
            <ProfileClick
              :nickname="user.nickname"
              :width="40"
              :height="40"
              :url-avatar="user.avatarPath"
              :user-id="user.id"
            ></ProfileClick>
          </td>
          <td>{{ user.nickname }}</td>
        </tr>
      </tbody>
    </div>
  </v-list>
</template>
<script>
import ProfileClick from '../components/ProfileClick.vue';

export default {
  components: {
    ProfileClick
  },
  inject: ['sessionStore', 'friendStore', 'connectedUsersStore'],
  data() {
    return {
      friends: this.friendStore.friends,
      connectedFriends: []
    };
  },
  watch: {
    connectedUsersStore: {
      handler() {
        this.friends = this.friendStore.friends;
        this.getConnectedFriends();
      },
      deep: true
    },
    friendStore: {
      handler() {
        this.friends = this.friendStore.friends;
        this.getConnectedFriends();
      },
      deep: true
    }
  },
  mounted() {
    this.friendStore
      .setFriends(this.sessionStore.nickname)
      .then(this.getConnectedFriends());
  },
  methods: {
    getConnectedFriends() {
      this.connectedFriends = [];
      for (let i = 0; i < this.friends.length; i++) {
        if (this.connectedUsersStore.isConnected(this.friends[i].id)) {
          this.connectedFriends.push(this.friends[i]);
        }
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.v-list {
  background-color: var(--dark-purple);
  border-style: solid;
  border-radius: 5px;
  box-shadow: 5px 5px 5px var(--light-purple);
  border-color: var(--light-purple) !important;
}

.connected {
  padding-left: 20px;
}

.online-btn {
  width: 100%;
  height: 100%;
  justify-content: flex-start;
}
.online-btn:hover {
  background-color: var(--light-purple);
}
</style>
