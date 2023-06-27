<template>
  <Profiles :nickname="nickname" />
</template>

<script>
import Profiles from '../components/Profiles.vue';

export default {
  components: {
    Profiles
  },
  props: ['nickname'],
  data() {
    return {};
  }
};
</script>
