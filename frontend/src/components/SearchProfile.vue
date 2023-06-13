<template>
  <v-form
        class="closed"
        :class="`${is_expanded ? 'is-expanded' : ''}`"
        @submit.prevent
      >
  <v-text-field
          v-model="search"
          placeholder="Search"
          class="expanding-search mt-1"
          prepend-inner-icon="mdi-magnify"
          @focus="searchClosed"
          @blur="searchClosed"
        >
        </v-text-field> <br> <br>
     
</v-form>
  <table id="myTable" class="table">
    <tbody v-if="search !== '' ">
      <tr v-for="user in filteredUsers" :key="user.id">
          <router-link to="/chat"><td>{{ user.nickname }}</td></router-link>
      </tr>
    </tbody>
   </table>
 </template>

<script>
import * as constants from '@/constants.ts';
import axios from 'axios';
import formatError from '@/utils/lib';
import swall from 'sweetalert';
import { mapStores } from 'pinia';
import { useSessionStore } from '@/store/session';

export default {
    data(){
        return{
            users: [],
            search: "",
            is_expanded: false
        };
    },
    computed: {
    filteredUsers() {
      return this.users.filter(p => {
        return p.nickname.toLowerCase().indexOf(this.search.toLowerCase()) != -1;
      });
    },
    ...mapStores(useSessionStore)

    },
    async created() {
    await this.getUsers();
  },
    methods: {
    async getUsers() {
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
    searchClosed() {
      this.is_expanded = !this.is_expanded;
    },
    isLog() {
      return this.sessionStore.loggedIn;
    },
  }
}
</script>

<style lang="scss">

.closed {
  display: flex;
  margin-top: 18px;
  width: 45px;
  :deep(.v-text-field .v-input__control .v-field__outline::before) {
    border: solid;
    border-radius: 5px;
  }
  :deep(.v-text-field .v-input__control .v-field__outline::after) {
    border: none;
  }
  :deep(.mdi-magnify) {
    cursor: pointer;
  }
  &.is-expanded {
    width: 300px;
    transition: width 0.3s;
    :deep .v-field--variant-filled .v-field__overlay {
      background-color: var(--light);
    }
  }
}

</style>