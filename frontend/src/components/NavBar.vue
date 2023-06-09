<template>
  <nav>
    <v-toolbar class="nav">
      <v-form
        v-if="isLog()"
        :class="`${is_expanded ? 'is-expanded' : ''}`"
        @submit.prevent
      >
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
        <SignCard :toSignin="true" />
        <SignCard />
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
import SignCard from './SignCard.vue';

export default {
  components: {
    SignCard
  },
  data() {
    return {
      is_expanded: false
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
    },
    searchClosed() {
      this.is_expanded = !this.is_expanded;
    }
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
