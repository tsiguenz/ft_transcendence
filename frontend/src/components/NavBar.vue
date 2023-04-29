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

:root {
	--light: #600FDF;
	--light-purple: #4508A0;
	--medium-purple: #2B0366;
	--dark-purple: #1F024A;
	--dark-alt: #0F0124;
}

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
.log:hover {
    background-position: right center;
}

.log {
    background-image: linear-gradient(to right, var(--light) 0%, var(--dark-purple) 51%, var(--light) 100%);
    flex: 1 1 auto;
    bottom: 0;
    text-align: center;
    text-transform: uppercase;
    transition: 0.5s;
    background-size: 200% auto;
    border-radius: 5px;
    display: flex;

}

.signup {
    text-align: center;
    text-transform: uppercase;
    border-radius: 10px;
    display: flex;
}

.button-group {
  display: flex;
  align-items: center;
}

.log, .signup {
  margin-left: 8px;
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