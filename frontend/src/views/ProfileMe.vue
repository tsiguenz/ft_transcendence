<template>
  <Profiles v-if="isMounted" :nickname="nickname" />
</template>

<script>
import { mapStores } from 'pinia';
import { useSessionStore } from '@/store/session';
import Profiles from '../components/Profiles.vue';

export default {
  components: {
    Profiles
  },
  data() {
    return {
      nickname: '',
      isMounted: false
    };
  },
  computed: {
    ...mapStores(useSessionStore)
  },
  async mounted() {
    await this.getNickname();
  },
  methods: {
    async getNickname() {
      this.nickname = await this.sessionStore.nickname;
      this.isMounted = true;
    }
  }
};
</script>
