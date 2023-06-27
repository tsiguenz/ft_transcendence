<template>
  <v-btn class="button" block
    >INVITE TO PLAY
    <v-dialog v-model="dialog" persistent activator="parent">
      <v-row align="center" justify="center">
        <v-card class="card">
          <v-card-title>
            <v-row class="ma-2" justify="space-between">
              <h2>Custom Game</h2>
              <v-btn color="transparent" @click="reset"
                ><v-icon icon="mdi-close"></v-icon
              ></v-btn>
            </v-row>
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text>
            <CustomGameMenu :user-id="userId" />
          </v-card-text>
        </v-card>
      </v-row>
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
  methods: {
    reset() {
      this.dialog = false;
    }
  }
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
