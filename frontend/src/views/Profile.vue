<template>
  <Profiles :nickname="nickname" />
</template>

<script>
import Profiles from '../components/Profiles.vue';

export default {
  props: ['nickname'],
  components: {
    Profiles
  },
  data() {
    return {};
  }
};
</script>
