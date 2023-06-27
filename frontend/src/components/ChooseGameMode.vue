<template>
  <v-container>
    <v-row>
      <v-col cols="6" align="right">
        <v-icon class="icon-size" icon="mdi-trophy-outline" />
        <v-btn class="log" @click="queueRanked">Search ranked match</v-btn>
      </v-col>
      <v-col cols="6" align="left">
        <v-icon class="icon-size" icon="mdi-flask-outline" />
        <v-btn class="log" @click="changeStatusToInMenu"
          >Create custom game</v-btn
        >
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  emits: ['queue-ranked', 'change-status-to-in-menu'],
  methods: {
    queueRanked() {
      this.$emit('queue-ranked');
    },
    changeStatusToInMenu() {
      this.$emit('change-status-to-in-menu');
    }
  }
};
</script>

<style scoped>
.icon-size {
  font-size: 120px;
  margin: 50px;
}

.div-choose-mode {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
