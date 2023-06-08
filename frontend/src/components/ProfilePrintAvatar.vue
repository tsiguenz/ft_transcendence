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
export default {
  props: ['wdt', 'hgt', 'urlAvatar'],
  data() {
    return {};
  }
};
</script>
<style>
.img {
  border: 2px solid var(--light);
}
</style>
