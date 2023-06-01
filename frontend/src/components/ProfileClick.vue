<template>
  <v-container class="cont">
    <v-row>
      <v-menu min-width="200px">
        <template #activator="{ props }">
          <v-btn icon v-bind="props" size="40px">
            <v-avatar class="mx-auto" size="40px">
              <ProfilePrintAvatar
                :wdt="width"
                :hgt="height"
                :url-avatar="urlAvatar"
              ></ProfilePrintAvatar>
            </v-avatar>
          </v-btn>
        </template>
        <v-card>
          <v-card-text class="conttext">
            <div class="mx-auto text-center">
              <v-avatar>
                <ProfilePrintAvatar
                  :wdt="width"
                  :hgt="height"
                  :url-avatar="urlAvatar"
                ></ProfilePrintAvatar>
              </v-avatar>
              <h3>{{ nickname }}</h3>
              <p class="text-caption mt-1">
                {{ status }}
              </p>
              <v-divider class="my-3"></v-divider>
              <router-link class="button" :to="'/Profile/' + nickname"
                >Show Profile</router-link
              >
            </div>
          </v-card-text>
        </v-card>
      </v-menu>
    </v-row>
  </v-container>
</template>

<script>
import ProfilePrintAvatar from '../components/ProfilePrintAvatar.vue';
import axios from 'axios';
import * as constants from '@/constants.ts';
import * as lib from '@/utils/lib';
import swall from 'sweetalert';

export default {
  components: {
    ProfilePrintAvatar
  },
  inject: ['connectedUsersStore', 'sessionStore'],
  props: ['nickname', 'status', 'width', 'height', 'urlAvatar'],
  data() {
    return {
      users: [],
      connectedUsers: this.connectedUsersStore.connectedUsers
    };
  },
  watch: {
    connectedUsersStore: {
      handler() {
        this.connectedUsers = this.connectedUsersStore.connectedUsers;
      },
      deep: true
    }
  },
  async mounted() {
    await this.getUsers();
  },
  methods: {
    async getUsers() {
      try {
        const jwt = this.$cookie.getCookie('jwt');
        const response = await axios.get(constants.API_URL + '/users', {
          headers: {
            Authorization: 'Bearer ' + jwt
          }
        });
        this.users = response.data;
      } catch (error) {
        swall({
          title: 'Error',
          text: lib.formatError(error.response.data.message),
          icon: 'error',
          button: 'OK'
        });
        this.$router.push('/logout');
      }
    },
    userStatus(user) {
      return this.connectedUsers.includes(user.id)
        ? 'Connected'
        : 'Disconnected';
    }
  }
};
</script>

<style lang="scss">
.cont {
  width: 1%;
  margin: 0;
}

.conttext {
  background: var(--dark-alt);
}
</style>
