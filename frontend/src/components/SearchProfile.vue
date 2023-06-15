<template>
  <div v-if="isLog()" class="search-container">
    <v-form  @submit.prevent @click="getUsers()">
      <v-text-field
        v-model="search"
        placeholder="Search"
        class="expanding-search mt-1"
        prepend-inner-icon="mdi-magnify"
        @focus="searchClosed()"
        @blur="searchClosed()"
      ></v-text-field>
    </v-form>
    <div
          v-if="search !== ''"
          :class="`${is_expanded ? 'is-expanded' : 'search-results'}`">
      <table
        id="myTable"
        class="table" >
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id">
            <v-btn><router-link
          :to="'/profile/' + user.nickname"
          @click="is_expanded === false">{{ user.nickname }}</router-link></v-btn>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import * as constants from '@/constants.ts';
import axios from 'axios';
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
    methods: {
      async getUsers() {
      if (!this.isLog()) return;
        const response = await axios.get(constants.API_URL + '/users');
        this.users = response.data;
    },
    isLog() {
      return this.sessionStore.loggedIn;
    },
    searchClosed() {
      this.is_expanded = !this.is_expanded;
    }
  }
}
</script>

<style lang="scss">

.v-form {
  display: flex;
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

}

.search-container {
  position: relative;
}

.search-results {
  display: none;
  &.is-expanded {
    display: unset;
    width: auto;
    z-index: 1000; /* This should be higher than the z-index of your navbar */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-radius: 3px;
    background-color: var(--dark-purple);
  }
}
.v-input__details {
  display: none !important;
}


</style>