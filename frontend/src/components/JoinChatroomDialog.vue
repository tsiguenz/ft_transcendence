<template>
	<v-dialog
	  v-model="dialog"
	  width="1024"
	>
	  <template v-slot:activator="{ props }">
	    <v-btn v-bind="props" block @click="getJoinableRooms()">
	      Join room
	    </v-btn>
	  </template>
	  <v-card>
	    <v-card-title>
	      <span class="text-h5">Join chatroom</span>
	    </v-card-title>
	    <v-card-text>
	      <v-container>
	      	<v-list>
	      		<v-list-subheader>Chatrooms</v-list-subheader>
			      <v-list-group
			      	v-for="chatroom in chatrooms"
			      	:key="chatroom.id"
			      	:value="chatroom.name"
			      >
			        <template v-slot:activator="{ props }">
			          <v-list-item
			            v-bind="props"
			            :prepend-icon="chatroom.type === 'PROTECTED' ? 'mdi-lock' : 'mdi-earth'"
			            :title="chatroom.name"
			          ></v-list-item>
			        </template>
			        <v-row class="ma-0">
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
			        	<v-col cols="4">
			        		<v-btn size="x-large" block @click="joinRoom(chatroom)">Join</v-btn>
			        	</v-col>
			        </v-row>
			      </v-list-group>
			    </v-list>
	      </v-container>
	    </v-card-text>
	    <v-card-actions>
	      <v-spacer></v-spacer>
	      <v-btn
	        color="blue-darken-1"
	        variant="text"
	        @click="closeDialog"
	      >
	        Close
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
  emits: [
    'join'
  ],
  data() {
    return {
    	chatrooms: [],
      dialog: false,
    }
  },
  methods: {
    closeDialog() {
      this.dialog = false;
    },
    async joinRoom(chatroom) {
    	try {
        const response = await axios.post(constants.API_URL + '/chatrooms/' + chatroom.id + '/join', {
        	...chatroom,
        });
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
        const response = await axios.get(constants.API_URL + '/chatrooms/joinable');
        this.chatrooms = response.data;
      } catch (error) {
      	swal({
          icon: 'error',
          text: formatError(error.response.data.message)
        });
      }
    },
  }
}

</script>
