<template>
  <v-card height="1000">
    <v-list>
      <v-list-subheader>Chatrooms</v-list-subheader>
      <v-list-item
        v-for="chatroom in chatrooms"
        :key="chatroom.id"
        :title="chatroom.name"
        :value="chatroom.name"
        :active="chatroom.id == id"
        @click="join(chatroom.id)"
      ></v-list-item>
    </v-list>
  </v-card>
 <v-dialog
    v-model="dialog"
    persistent
    width="1024"
  >
    <template v-slot:activator="{ props }">
      <v-btn v-bind="props" block>
        New chatroom
      </v-btn>
    </template>
    <v-card>
      <v-card-title>
        <span class="text-h5">Chatroom</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="newChatroomName"
                label="Room name*"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" >
              <v-select
                v-model="newChatroomType"
                :items="['PUBLIC', 'PROTECTED', 'PRIVATE']"
                label="Room type*"
                required
              ></v-select>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-if="newChatroomType === 'PROTECTED'"
                label="Password*"
                required
              ></v-text-field>
            </v-col>
          </v-row>
        </v-container>
        <small>*indicates required field</small>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="blue-darken-1"
          variant="text"
          @click="dialog = false"
        >
          Close
        </v-btn>
        <v-btn
          color="blue-darken-1"
          variant="text"
          @click="newChatroom"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import axios from 'axios';
import * as constants from '@/constants';
import ChatService from '../services/chat.service';

export default {
  data() {
    return {
      chatrooms: [],
      newChatroomName: '',
      dialog: false,
      newChatroomType: 'PUBLIC'
    }
  },
  props: [
    'id',
  ],
  emits: [
    'join'
  ],
  mounted() {
    this.loadChatrooms().then((chatrooms) => {
      this.join(chatrooms[0].id);
    });
  },
  methods: {
    join(id) {
      this.$emit('join', id);
    },
    async loadChatrooms() {
      const chatrooms = await this.getChatrooms();
      this.chatrooms.push(...chatrooms);
      return chatrooms;
    },
    async getChatrooms() {
      try {
        const response = await axios.get(constants.API_URL + '/chatrooms/mine');
        return response.data;
      } catch (error) {
        alert(error.response.data.message);
      }
    },
    async newChatroom() {
      this.dialog = false;
      // TODO: clean the input to protect injection
      try {
        const response = await axios.post(constants.API_URL + '/chatrooms', {
          name: this.newChatroomName,
          type: this.newChatroomType
        });
        this.chatrooms.push(response.data);
        ChatService.joinRoom(response.data.id);
        console.log(response.data);
      } catch (error) {
        alert(error.response.data.message);
      }
      this.newChatroomName = '';
      this.newChatroomType = 'PUBLIC';
    },
  }
}

</script>
