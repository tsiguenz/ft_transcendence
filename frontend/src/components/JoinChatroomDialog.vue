<template>
  <v-card class="roomsjoin">
    <v-card-title>
      <span class="text-h5">Join a public room</span>
    </v-card-title>
    <v-divider class="my-0 divider" />
    <v-container class="fill-height pa-0">
      <v-row class="no-gutters elevation-4">
        <v-col cols="12" class="flex-grow-1 flex-shrink-0">
          <v-responsive class="overflow-y-auto fill-height" height="500">
            <template v-if="chatrooms.length === 0">
              <v-col col="10">
                <v-list class="noroom">
                  <h3>:(</h3>
                  <h3>No chatrooms available</h3>
                </v-list>
              </v-col>
            </template>
            <template v-else>
              <v-list subheader>
                <v-list-item
                  v-for="chatroom in chatrooms"
                  :key="chatroom.id"
                  class="rooms"
                  :value="chatroom.name"
                >
                  <v-row no-gutters>
                    <v-col cols="1">
                      <v-icon>{{
                        chatroom.type === 'PROTECTED' ? 'mdi-lock' : 'mdi-earth'
                      }}</v-icon>
                    </v-col>

                    <v-col cols="7">
                      <v-list-item-title>
                        {{ chatroom.name }}
                      </v-list-item-title>
                    </v-col>

                    <v-col cols="3">
                      <template v-if="chatroom.type === 'PROTECTED'">
                        <v-dialog v-model="dialog" max-width="500px">
                          <template #activator="{ props }">
                            <v-btn class="joinbtn" size="small" v-bind="props"
                              >Join</v-btn
                            >
                          </template>
                          <v-card class="window">
                            <v-card-title>
                              <span class="text-h6">Please enter password</span>
                              <v-text-field
                                v-model="chatroom.password"
                                variant="outlined"
                                type="password"
                                label="Password"
                                required
                              >
                              </v-text-field>
                            </v-card-title>
                            <v-card-actions>
                              <v-spacer></v-spacer>
                              <v-btn
                                color="blue darken-1"
                                text
                                @click="dialog = false"
                                >Close</v-btn
                              >
                              <v-btn
                                class="joinbtn"
                                size="small"
                                @click="joinRoom(chatroom)"
                                >Join</v-btn
                              >
                            </v-card-actions>
                          </v-card>
                        </v-dialog>
                      </template>
                      <template v-else>
                        <v-btn
                          class="joinbtn"
                          size="small"
                          @click="joinRoom(chatroom)"
                          >Join</v-btn
                        >
                      </template>
                    </v-col>
                  </v-row>
                </v-list-item>
              </v-list>
            </template>
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
import ChatService from '../services/chat.service';
import * as lib from '@/utils/lib';

export default {
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
      ChatService.joinRoom({
        chatroomId: chatroom.id,
        password: chatroom.password
      });
      this.closeDialog();
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
          text: lib.formatError(error.response.data.message)
        });
      }
    }
  }
};
</script>

<style scoped>
.rooms {
  height: 50px;
  margin-top: 0;
  margin-bottom: 0;
}

.roomsjoin {
  background-color: var(--dark-purple);
  border-style: solid;
  border-radius: 5px;
  box-shadow: 5px 5px 5px var(--light-purple);
  border-color: var(--light-purple) !important;
}

.v-list {
  background: var(--dark-purple) !important;
  border-radius: 5px !important;
}

.joinbtn {
  background: var(--light-purple) !important;
}

.noroom {
  height: 500px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}
</style>
