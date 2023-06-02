<template>
  <v-container>
    <p>{{ message }}</p>
  </v-container>
</template>

<script>
export default {
  props: {
    isRanked: Boolean
  },
  emits: ['create-custom-room'],
  data() {
    return {
      message: ''
    };
  },
  created() {
    this.message = this.isRanked
      ? 'Waiting for an opponent'
      : 'Waiting for your opponent';
  }
};
</script>
