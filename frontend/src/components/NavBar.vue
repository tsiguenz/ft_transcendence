<template>
    <nav>
      <v-toolbar class="nav">
          <v-form v-if="isLog()" :class="`${is_expanded ? 'is-expanded' : ''}`" @submit.prevent >
            <v-text-field
              placeholder="Search"
              class="expanding-search mt-1"
              prepend-inner-icon="mdi-magnify"
              @focus="searchClosed"
              @blur="searchClosed"
            >
            </v-text-field>
          </v-form>
        <v-spacer></v-spacer>
        <div v-if="!isLog()" class="button-group">
        <v-btn class="log" to="/signin">Sign In</v-btn>
        <v-btn variant="outlined" class="signup" to="/signup">Sign Up</v-btn>
      </div>
      <div v-if="isLog()" class="button-group">
        <v-btn class="log" to="/logout">Logout</v-btn>
      </div>
    </v-toolbar>
    </nav>
  </template>
  
  <script>

import { mapStores } from 'pinia';
import { useSessionStore } from '@/store/session';

export default {
  computed: {
    pageTitle() {
      return this.$route.name || 'Default Title';
    },
    ...mapStores(useSessionStore)
  },
	methods: {
		isLog() {
			return this.sessionStore.loggedIn;
		}
	},
};
</script>

<script setup>

import { ref } from 'vue';

const is_expanded = ref(false)
const searchClosed = () => {
  is_expanded.value = !is_expanded.value;
}
</script>
  
<style lang="scss" scoped>

.nav{
    background: var(--dark-alt);
    padding-right: 1%;
}
.title{
    font-weight: 500;
    font-size: larger;
    display: flex;
    flex:1 0 auto;
}

.v-form{
  display: flex;
  margin-top: 1.25%;
  width: 45px;
  :deep .v-text-field .v-input__control .v-field__outline::before{
    border :solid;
    border-radius: 5px;

  }
  :deep .v-text-field .v-input__control .v-field__outline::after{
    border :none;
  }
  :deep .mdi-magnify{
    cursor: pointer;
  }
  .addButton{
    display: none ;
  }
  &.is-expanded {
      .addButton{
      display: flex;
      align-items: center;
    }
    width: 300px;
    transition: width 0.3s;
    :deep .v-field--variant-filled .v-field__overlay{
      background-color: var(--light);
    }
  }
}
</style>