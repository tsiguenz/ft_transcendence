<template>
  <v-table v-if="friends.length === 0" class="friends" density="compact">
    <h2>Friends</h2>
    <v-col col="10">
      <v-list class="noroom">
        <h3>:(</h3>
        <h3>Oops nothing here</h3>
      </v-list>
    </v-col>
  </v-table>
  <v-table v-else class="friends" density="compact">
    <thead>
      <tr class="cust-tr">
        <th class="cust-th">Nickname</th>
        <th class="cust-th">Ladder points</th>
        <th class="cust-th"></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="friend in friends" :key="friend.id">
        <td class="cust-td hgt-td">
          <ProfileClick
            :nickname="friend.nickname"
            :user-id="friend.id"
            :width="40"
            :height="40"
            :url-avatar="getAvatarPath(friend)"
          ></ProfileClick>
          <p>{{ friend.nickname }}</p>
        </td>
        <td class="hgt-td">{{ friend.ladderPoints }}</td>
        <td class="hgt-td">
          <IsFriend
            :friendname="friend.nickname"
            :is-friend-at-begining="isFriend(friend.nickname)"
          ></IsFriend>
        </td>
      </tr>
    </tbody>
  </v-table>
</template>

<script>
import IsFriend from '../components/IsFriend.vue';
import ProfileClick from '../components/ProfileClick.vue';

export default {
  components: {
    IsFriend,
    ProfileClick
  },
  inject: ['sessionStore', 'friendStore'],

  data() {
    return {
      newFriend: '',
      connectedFriends: [],
      friends: this.friendStore.friends
    };
  },
  watch: {
    friendStore: {
      handler() {
        this.friends = this.friendStore.friends;
      },
      deep: true
    }
  },
  created() {
    this.friendStore
      .setFriends(this.sessionStore.nickname)
      .then(this.getConnectedFriends());
  },
  methods: {
    getConnectedFriends() {
      this.connectedFriends = [];
      for (let i = 0; i < this.friends.length; i++) {
        if (this.connectedUsers.includes(this.friends[i].id)) {
          this.connectedFriends.push(this.friends[i]);
        }
      }
    },
    getAvatarPath(user) {
      return user.avatarPath;
    },
    isFriend(nickname) {
      return this.friends.some((friend) => friend.nickname === nickname);
    }
  }
};
</script>

<style lang="scss" scoped>
.noroom {
  background-color: var(--dark-purple);
}
.friends {
  padding-top: 12px;
  text-align: center;
  background-color: var(--dark-purple);
  border-radius: 2px;
  box-shadow: 5px 5px 5px var(--light-purple);
}

.cust-th {
  color: #ffff !important;
  text-transform: uppercase;
}

.hgt-td {
  height: 60px !important;
}

.cust-td {
  display: flex !important;
  padding: 1rem;
  p {
    margin-top: auto;
    margin-bottom: auto;
    margin-left: 10px;
  }
}
</style>
