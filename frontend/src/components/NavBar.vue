<template>
  <nav>
    <v-toolbar class="nav">
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
import { mapStores } from 'pinia';
import { useSessionStore } from '@/store/session';

export default {
  components: {
    SignCard
  },
  data() {
    return {
      users: [],
      search: ''
    };
  },
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

<style lang="scss" scoped>
.nav {
  background: var(--dark-alt);
  padding-right: 1%;
  position: relative;
}
</style>
