<template>
  <profiles :otherUser="otherUser" />
</template>

<script>
import Profiles from '../components/Profiles.vue';

export default {
  props: ['otherUser'],
  components: {
    Profiles
  },
  data() {
    return {};
  }
};
</script>
