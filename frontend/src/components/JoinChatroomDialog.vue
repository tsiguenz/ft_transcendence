<template>
    <v-card>
      <v-card-title>
        <span class="text-h5">Join chatroom</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-list>
            <v-list-subheader>Chatrooms</v-list-subheader>
            <v-list-item
              v-for="chatroom in chatrooms"
              :key="chatroom.id"
            >
                <v-icon>
                  {{ chatroom.type === 'PROTECTED' ? 'mdi-lock' : 'mdi-earth' }}
                </v-icon>
                <v-list-item-title>{{ chatroom.name }}</v-list-item-title>
              <v-list-item-action>
                <v-row>
                <v-col cols="8" pa-0>
                  <v-text-field
                    v-if="chatroom.type === 'PROTECTED'"
                    v-model="chatroom.password"
                    variant="outlined"
                    type="password"
                    label="Password"
                    required
                  ></v-text-field>
                </v-col>
                
              </v-row>
                <v-btn size="x-large" @click="joinRoom(chatroom)">Join</v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        
      </v-card-actions>
    </v-card>
</template>

<script>
import axios from 'axios';
import * as constants from '@/constants';
import swal from 'sweetalert';
import formatError from '@/utils/lib';

export default {
  emits: ['join'],
  data() {
    return {
      chatrooms: [],
      dialog: true  // make the dialog open by default
    };
  },
  created() {
    // Load joinable rooms when the component is created
    this.getJoinableRooms();
  },
  methods: {
    closeDialog() {
      this.dialog = false;
    },
    async joinRoom(chatroom) {
      try {
        const response = await axios.post(
          constants.API_URL + '/chatrooms/' + chatroom.id + '/join',
          {
            ...chatroom
          }
        );
        this.chatrooms = response.data;
        this.$emit('join', chatroom);
        this.closeDialog();
      } catch (error) {
        swal({
          icon: 'error',
          text: formatError(error.response.data.message)
        });
      }
    },
    async getJoinableRooms() {
      try {
        const response = await axios.get(
          constants.API_URL + '/chatrooms/joinable'
        );
        this.chatrooms = response.data;
      } catch (error) {
        swal({
          icon: 'error',
          text: formatError(error.response.data.message)
        });
      }
    }
  }
};
</script>
