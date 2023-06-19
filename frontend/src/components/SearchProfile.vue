<template>
  <div v-if="isLog()" class="search-container">
    <v-form class="search-bar" @submit.prevent @click="getUsers()">
      <v-text-field
        v-model="search"
        placeholder="Search"
        class="expanding-search mt-1"
        prepend-inner-icon="mdi-magnify"
      ></v-text-field>
    </v-form>
    <div
          v-if="search !== ''"
          :class="`${is_expanded ? 'is-expanded' : 'search-results'}`">
      <table
        id="myTable"
        class="widthfor tablefor" >
        <tbody class="widthfor" >
          <tr class="widthfor namefor" v-for="user in filteredUsers" :key="user.id">
            <div class="name" @click="userSelected(user)">{{ user.nickname }}</div>
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
            is_expanded: true
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
    },
    userSelected(user) {
        this.$emit('user-selected', user);
        this.search = '';
      },
      
  }
}
</script>

<style lang="scss">

.search-bar{
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

.widthfor{
  width: 300px !important;
}

.search-container {
  position: relative;
  background-color: var(--dark-purple) !important;
  border-radius: 3px 3px;
  
}

.search-results {
  display: none;
  &.is-expanded {
    display: unset;
    width: auto;
    z-index: 1000; /* This should be higher than the z-index of your navbar */
  }
}
.v-input__details {
  display: none !important;
}

.namefor{
  height: 30px;
}

.name{
  text-decoration: none;
  color: #ffff;
  width: 100%;
  padding-left: 5px;
  padding-top: 2px;
}

.namefor:hover{
  background-color: var(--light);
  
}

.tablefor{
  box-shadow: var(--light) 0px 3px 8px;
}

</style>