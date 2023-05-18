<template>
  <img
    :src="urlAvatar"
    alt="avatar"
    class="rounded-pill"
    :width="wdt"
    :height="hgt"
  />
</template>

<script>
import { mapStores } from 'pinia';
import { useSessionStore } from '@/store/session';

export default {
  props: ['wdt', 'hgt', 'urlAvatar'],
  data() {
    return {};
  },
  computed: {
    ...mapStores(useSessionStore)
  }
};
</script>
