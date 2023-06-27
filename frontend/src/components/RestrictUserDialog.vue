<template>
  <v-dialog v-model="dialog" width="1024">
    <template #activator="{ props }">
      <v-btn class="button" v-bind="props" block>{{ action }}</v-btn>
    </template>
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ action }} {{ nickname }}</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="banTime"
                type="number"
                :rules="rules"
                label="Restrict time (minutes)"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          class="button"
          color="blue-darken-1"
          variant="text"
          @click="closeDialog"
        >
          Close
        </v-btn>
        <v-btn
          color="blue-darken-1"
          variant="text"
          :disabled="1 > banTime || banTime > 100000000"
          @click="restrict"
        >
          {{ action }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: ['nickname', 'action', 'userId'],
  emits: ['restrict'],
  data() {
    return {
      dialog: false,
      banTime: 15,
      rules: [
        (value) => !!value || 'Required',
        (value) =>
          !(1 > value || value > 100000000) ||
          "Value should be between 1 and 100'000'000"
      ]
    };
  },
  methods: {
    closeDialog() {
      this.dialog = false;
      this.banTime = 15;
    },
    restrict() {
      this.$emit('restrict', { userId: this.userId, time: this.banTime });
      this.closeDialog();
    }
  }
};
</script>
<style scoped>
.button {
  background: var(--medium-purple) !important;
}
</style>
