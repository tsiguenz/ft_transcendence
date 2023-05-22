<template>
  <img
    :src="urlAvatar"
    alt="avatar"
    class="img rounded-pill"
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
  }
};
</script>
<style>
.img {
  border: 3px solid var(--light);
}
</style>
