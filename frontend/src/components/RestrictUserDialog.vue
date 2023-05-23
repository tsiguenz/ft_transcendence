<template>
  <v-dialog v-model="dialog" width="1024">
    <template v-slot:activator="{ props }">
      <v-btn v-bind="props" block>{{ action }}</v-btn>
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
                label="Restrict time"
                type="number"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue-darken-1" variant="text" @click="closeDialog">
          Close
        </v-btn>
        <v-btn color="blue-darken-1" variant="text" @click="restrict">
          {{ action }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import axios from 'axios';
import * as constants from '@/constants';
import swal from 'sweetalert';
import formatError from '@/utils/lib';

export default {
  emits: ['restrict'],
  props: ['nickname', 'action', 'userId'],
  data() {
    return {
      dialog: false,
      banTime: 0 
    };
  },
  methods: {
    closeDialog() {
      this.dialog = false;
      this.banTime = 0;
    },
    restrict() {
      this.$emit('restrict', { userId: this.userId, time: this.banTime });
      this.closeDialog();
    }
  }
};
</script>
