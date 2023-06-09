<template>
    <v-list>
        <v-list-subheader>Connected Friends</v-list-subheader>
        <div class="online-btn"><tbody>
           <tr v-for="user in connectedFriends" :key="user.id">
            <td class="connected" > <ProfileClick :nickname="user.nickname" :width="40" :height="40" :url-avatar="user.avatarPath" :status="userStatus(user)"></ProfileClick></td>
            <td>{{ user.nickname }}</td>
           </tr>
        </tbody></div>
    </v-list>
</template>
<script>

import * as constants from '@/constants.ts';
import axios from 'axios';
import swall from 'sweetalert';
import formatError from '@/utils/lib';
import ProfileClick from '../components/ProfileClick.vue';


export default {
    components: {
    ProfileClick,
  },
    inject: ['connectedUsersStore', 'sessionStore'],
    data () {
        return {
            friends: [],
            connectedUsers: this.connectedUsersStore.connectedUsers,
            connectedFriends: []
        }
    },
    watch: {
    connectedUsersStore: {
      handler() {
        this.connectedUsers = this.connectedUsersStore.connectedUsers;
      },
      deep: true
    },

  },
    async mounted() {
        await this.getFriends();
        this.getConnectedFriends();
    },
   methods: {
    async getFriends() {
      try {
        const jwt = this.$cookie.getCookie('jwt');
        const response = await axios.get(
          constants.API_URL + `/users/${this.sessionStore.nickname}/friends`,
          {
            headers: {
              Authorization: 'Bearer ' + jwt
            }
          }
        );
        this.friends = response.data;
        this.friends.forEach((friend) => {
          friend.avatarPath = constants.AVATARS_URL + friend.avatarPath;
        });
      } catch (error) {
        swall({
          title: 'Error',
          text: formatError(error.response.data.message),
          icon: 'error',
          button: 'OK'
        });
        this.$router.push('/logout');
      }
    },
    getConnectedFriends() {
        this.connectedFriends = [];
        for (let i = 0; i < this.friends.length; i++) {
            if (this.connectedUsers.includes(this.friends[i].id)) {
                this.connectedFriends.push(this.friends[i]);
        }
    }
},
    userStatus(user) {
      if (this.connectedUsers.includes(user.id)){
        return true;
      }
      return false;
    },
   }
}

</script>

<style lang="scss" scoped>

.v-list{
    background-color: var(--dark-purple);
    border-style: solid;
    border-radius: 5px;
    box-shadow: 5px 5px 5px var(--light-purple);
    border-color: var(--light-purple) !important;
}

.connected{
    padding-left: 20px;
}

.online-btn{
    width: 100%;
    height: 100%;
    justify-content: flex-start;
}
.online-btn:hover{
    background-color: var(--light-purple);
}
</style>