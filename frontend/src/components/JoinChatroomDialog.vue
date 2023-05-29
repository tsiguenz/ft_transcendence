<template>
    <v-card>
      <v-card-title>
        <span class="text-h5">Join a public room</span>
      </v-card-title>
      <v-container
          class="fill-height pa-0 "
        >
          <v-row class="no-gutters elevation-4">
        <v-col 
              cols="12" 
              class="flex-grow-1 flex-shrink-0">
            <v-responsive
                class="overflow-y-auto fill-height"
                height="500"
              >
          <v-list subheader>
            <v-list-item-group v-model="activeChat">
            <template
              v-for="chatroom in chatrooms"
              :key="chatroom.id"
              
            >
            <v-list-item class="rooms"  :value="chatroom.name">
            <v-row no-gutters>
              <v-col cols="1">
                <v-list-item-avatar>
                  <v-icon>{{ chatroom.type === 'PROTECTED' ? 'mdi-lock' : 'mdi-earth' }}</v-icon>
                </v-list-item-avatar>
              </v-col>

              <v-col cols="7">
                <v-list-item-content>
                  <v-list-item-title> {{ chatroom.name }} </v-list-item-title>
                </v-list-item-content>
              </v-col>

              <v-col cols="3">
        <template v-if="chatroom.type === 'PROTECTED'">
          <v-dialog v-model="dialog" max-width="500px">
            <template #activator="{ props }">
              <v-btn class="joinbtn" size="small" v-bind="props">Join</v-btn>
            </template>
          <v-card>
            <v-card-title>
              <span class="text-h5">Please enter password</span>
               <v-text-field
                   
                    v-model="chatroom.password"
                    variant="outlined"
                    type="password"
                    label="Password"
                    required
                  > </v-text-field>
            </v-card-title>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="dialog = false">Close</v-btn>
              <v-btn class="joinbtn" size="small" @click="joinRoom(chatroom)">Join</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        </template>
        <template v-else>
          <v-btn class="joinbtn" size="small" @click="joinRoom(chatroom)">Join</v-btn>
        </template>
      </v-col>
    </v-row>
  </v-list-item>
          <v-divider
                  class="my-0 divider"
                />

            </template>
          </v-list-item-group>
          </v-list>
          </v-responsive>
          </v-col>
          </v-row>
        </v-container>
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
      activeChat: 1,
      chatrooms: [],
      dialog: false
    };
  },
  created() {
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

<style scoped>
.rooms{
  height: 50px;
  margin-top: 0;
  margin-bottom: 0;
}

.v-card{
  background: var(--dark-purple);
}
.v-list{
  background: var(--dark-purple) !important;
}

.joinbtn{
  background: var(--light-purple) !important;

}

</style>
