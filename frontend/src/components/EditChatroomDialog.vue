<template>
  <v-dialog v-model="dialog" width="1024">
    <template v-slot:activator="{ props }">
      <v-btn v-bind="props" icon="mdi-cog"></v-btn>
    </template>
    <v-card>
      <v-card-title>
        <span class="text-h5">Edit chatroom</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="newPassword"
                label="New password"
                type="password"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-btn color="red-darken-1" variant="text" @click="alertDeleteChatroom">
          Delete chatroom
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn color="blue-darken-1" variant="text" @click="closeDialog">
          Close
        </v-btn>
        <v-btn color="blue-darken-1" variant="text" @click="editChatroom">
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import axios from 'axios';
import * as constants from '@/constants';
import swal from 'sweetalert';
import * as lib from '@/utils/lib';
import ChatService from '../services/chat.service';

export default {
  emits: ['create', 'delete'],
  props: ['id'],
  data() {
    return {
      dialog: false,
      newPassword: ''
    };
  },
  methods: {
    closeDialog() {
      this.dialog = false;
      this.newPassword = '';
    },
    async editChatroom() {
      try {
        const response = await axios.patch(
          constants.API_URL + '/chatrooms/' + this.id,
          {
            password: this.newPassword
          }
        );
        this.closeDialog();
      } catch (error) {
        swal({
          icon: 'error',
          text: lib.formatError(error.response.data.message)
        });
      }
    },
    alertDeleteChatroom() {
      swal({
        icon: 'warning',
        text: 'This will permanently delete the chatroom, do you wish to continue?',
        buttons: {
          confirm: 'Delete',
          cancel: 'Go back'
        }
      }).then((confirm) => {
        if (confirm) {
          this.deleteChatroom();
        }
      });
    },
    async deleteChatroom() {
      try {
        ChatService.deleteRoom(this.id);
        this.closeDialog();
        this.$emit('delete', this.id);
      } catch (error) {
        swal({
          icon: 'error',
          text: lib.formatError(error.response.data.message)
        });
      }
    }
  }
};
</script>
