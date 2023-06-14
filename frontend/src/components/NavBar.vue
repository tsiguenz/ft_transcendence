<template>
  <nav>
    <v-toolbar class="nav">
      <v-form
        v-if="isLog()"
        @submit.prevent
        @click="getUsers()"
      >
    <v-text-field
      v-model="search"
      placeholder="Search"
      class="expanding-search mt-1"
      prepend-inner-icon="mdi-magnify"
    >
    </v-text-field> <br> <br>
    <table id="myTable" class="table">
      <tbody v-if="search !== ''">
        <tr v-for="user in filteredUsers" :key="user.id">
            <router-link :to="'/profile/' + user.nickname">{{ user.nickname }}</router-link>
        </tr>
      </tbody>
    </table>
  </v-form>
    
      <v-spacer></v-spacer>
      <div v-if="!isLog()" class="button-group">
        <SignCard :to-signin="true" />
        <SignCard />
      </div>
      <div v-if="isLog()" class="button-group">
        <v-btn class="log" to="/logout">Logout</v-btn>
      </div>
    </v-toolbar>
  </nav>
</template>

<script>
import SignCard from './SignCard.vue';
import * as constants from '@/constants.ts';
import axios from 'axios';
import formatError from '@/utils/lib';
import swall from 'sweetalert';
import { mapStores } from 'pinia';
import { useSessionStore } from '@/store/session';

export default {
  components: {
    SignCard,
  },
  data() {
    return {
      users: [],
      search: "",
    };
  },
  computed: {
    pageTitle() {
      return this.$route.name || 'Default Title';
    },
    filteredUsers() {
      return this.users.filter(p => {
        return p.nickname.toLowerCase().indexOf(this.search.toLowerCase()) != -1;
      });
    },
    ...mapStores(useSessionStore)
  },
  methods: {
    async getUsers() {
      if (!this.isLog()) return;
      try {
        const response = await axios.get(constants.API_URL + '/users');
        this.users = response.data;
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
    isLog() {
      return this.sessionStore.loggedIn;
    },
}
};
</script>

<style lang="scss" scoped>
.nav {
  background: var(--dark-alt);
  padding-right: 1%;
}
.v-form {
  display: flex;
  margin-top: 18px;
  width: 300px;

  :deep(.v-text-field .v-input__control .v-field__outline::before) {
    border: solid;
    border-radius: 3px;
  }
  :deep(.v-text-field .v-input__control .v-field__outline::after) {
    border: none;
  }
  :deep(.mdi-magnify) {
    cursor: pointer;
  }
  .table{
    background-color: var(--light);

  }
}
</style>
