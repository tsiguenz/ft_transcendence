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
            <v-icon
              :class="statusStyle"
              class="statusUser"
              size="15px"
              icon="mdi-circle"
            ></v-icon>
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
                {{ printStatusConnection() }}
              </p>
              <v-divider class="my-3"></v-divider>
              <router-link class="button" :to="'/profile/' + nickname"
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
import * as constants from '@/constants.ts';

export default {
  components: {
    ProfilePrintAvatar
  },
  inject: ['connectedUsersStore', 'inGameUsersStore', 'sessionStore'],
  props: ['nickname', 'userId', 'width', 'height', 'urlAvatar'],
  data() {
    return {
      status: constants.USER_STATUS.OFFLINE,
      connectedUsers: this.connectedUsersStore.connectedUsers,
      inGameUsers: this.inGameUsersStore.inGameUsers,
      connected: false
    };
  },
  computed: {
    statusStyle() {
      if (this.status === constants.USER_STATUS.ONLINE) return 'co';
      if (this.status === constants.USER_STATUS.OFFLINE) return 'unco';
      if (this.status === constants.USER_STATUS.IN_GAME) return 'in-game';
    }
  },
  watch: {
    connectedUsersStore: {
      handler() {
        this.connectedUsers = this.connectedUsersStore.connectedUsers;
      },
      deep: true
    },
    inGameUsersStore: {
      handler() {
        this.inGameUsers = this.inGameUsersStore.inGameUsers;
      },
      deep: true
    }
  },
  mounted() {
    this.status = this.userStatus(this.userId);
  },
  methods: {
    userStatus(userId) {
      if (this.inGameUsersStore.isInGame(userId))
        return constants.USER_STATUS.IN_GAME;
      if (this.connectedUsersStore.isConnected(userId))
        return constants.USER_STATUS.ONLINE;
      return constants.USER_STATUS.OFFLINE;
    },
    printStatusConnection() {
      if (this.status === constants.USER_STATUS.ONLINE) return 'Online';
      if (this.status === constants.USER_STATUS.OFFLINE) return 'Offline';
      if (this.status === constants.USER_STATUS.IN_GAME) return 'In Game';
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

.statusUser {
  position: absolute;
  bottom: -5px;
  right: -5px;
  border-color: #ffff;
}

.co {
  color: #58c400;
}

.unco {
  color: #757575;
}

.in-game {
  color: #ff9800;
}
</style>
