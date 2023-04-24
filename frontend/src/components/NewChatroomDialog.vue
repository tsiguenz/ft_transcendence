<template>
	<v-dialog
	  v-model="dialog"
	  persistent
	  width="1024"
	>
	  <template v-slot:activator="{ props }">
	    <v-btn v-bind="props" block>
	      +
	    </v-btn>
	  </template>
	  <v-card>
	    <v-card-title>
	      <span class="text-h5">Create chatroom</span>
	    </v-card-title>
	    <v-card-text>
	      <v-container>
	        <v-row>
	          <v-col cols="12">
	            <v-text-field
	              v-model="newChatroomObject.name"
	              label="Room name*"
	              required
	            ></v-text-field>
	          </v-col>
	          <v-col cols="12" >
	            <v-select
	              v-model="newChatroomObject.type"
	              :items="['PUBLIC', 'PROTECTED', 'PRIVATE']"
	              label="Room type*"
	              required
	            ></v-select>
	          </v-col>
	          <v-col cols="12">
	            <v-text-field
	              v-if="newChatroomObject.type === 'PROTECTED'"
	              v-model="newChatroomObject.password"
	              label="Password*"
	              type="password"
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
	        @click="closeDialog"
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
import swal from 'sweetalert';
import formatError from '@/utils/lib';

export default {
  emits: [
    'create'
  ],
  data() {
    return {
      newChatroomObject: { name: '', type: 'PUBLIC', password: null },
      dialog: false,
    }
  },
  methods: {
    closeDialog() {
      this.dialog = false;
      this.newChatroomObject = { name: '', type: 'PUBLIC', password: null };
    },
    async newChatroom() {
      // TODO: clean the input to protect injection
      try {
        const response = await axios.post(constants.API_URL + '/chatrooms', {
          ...this.newChatroomObject
        });
        this.$emit('create', response.data);
      	this.closeDialog();
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
