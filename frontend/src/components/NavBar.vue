<template>
    <nav>
      <v-toolbar class="nav">
        <v-toolbar-title class="mx-auto">
          <span class="title">{{ pageTitle }}</span>
        </v-toolbar-title>
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
	}
};
  </script>
  
<style scoped>

:root {
	--light: #600FDF;
	--light-purple: #4508A0;
	--medium-purple: #2B0366;
	--dark-purple: #1F024A;
	--dark-alt: #0F0124;
}

.nav{
    background: #0F0124;
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

</style>