<template>
  <v-container flex class="font">
    <v-row justify="center">
      <h1>{{ user.ladderPoints }}</h1>
    </v-row>
    <v-row justify="center">
      <h3>Ladder Points</h3>
    </v-row>
  </v-container>
</template>

<script>
export default {
  props: ['user'],
  data() {
    return {};
  }
};
</script>

<style>
.font {
  font-family: 'Poppins', serif;
}
</style>
