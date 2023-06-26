<template>
  <v-btn block
    >INVITE TO PLAY
    <v-dialog v-model="dialog" persistent activator="parent">
      <v-container class="">
        <v-card class="card">
          <p>here is the dialog</p>
          <CustomGameMenu :user-id="userId" />
        </v-card>
      </v-container>
    </v-dialog>
  </v-btn>
</template>

<script>
import CustomGameMenu from './CustomGameMenu.vue';

export default {
  components: {
    CustomGameMenu
  },
  props: {
    userId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      dialog: false
    };
  },
  methods: {}
};
</script>

<style lang="scss" scoped>
.card {
  background: var(--dark-purple);
  border-radius: 30px;
  height: 100%;
  width: 400px;
}
</style>
