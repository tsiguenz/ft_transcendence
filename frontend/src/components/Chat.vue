<template>
	<v-list ref="chat" height="1000" class="overflow-y-auto">
	  <v-list-subheader>{{ title }}</v-list-subheader>
	  <div v-for="item in messages" :key="item.sentAt">
	    <p class="text-right ma-2" ><a v-if="item.authorId === currentUserId" class="rounded-pill pa-1 bg-blue">{{ item.data }}</a></p>
	    <p class="text-left ma-2"><a v-if="item.authorId !== currentUserId" class="rounded-pill pa-1 bg-green" >{{ item.authorNickname }}: {{ item.data }}</a></p>
	  </div>
	</v-list>
  <v-text-field
    v-model="newMessage"
    label="Message"
    @keyup.enter="sendMessage"
  ></v-text-field>
</template>

<script>
import ChatService from '../services/chat.service';
import { mapStores } from 'pinia';
import { useSessionStore } from '@/store/session';

export default {
  props: [
  	'id',
  	'title',
  	'messages'
  ],
	data() {
    return {
    	newMessage: ''
    }
  },
  computed: {
	  ...mapStores(useSessionStore),
	  currentUserId() {
	    return this.sessionStore.userId;
	  }
	},
  watch: {
	  messages: {
	    handler() {
    		this.$nextTick(() => {
					this.$refs.chat.$el.scrollTop = this.$refs.chat.$el.scrollHeight;
				});
	    },
	    deep: true
	  },
	},
	created() {
    ChatService.setup(this.$cookie.getCookie('jwt'));
  },
  mounted() {
    ChatService.subscribeToMessages((message) => {
      ChatService.storeMessage(message);
    });
  },
  beforeUnmount() {
    ChatService.disconnect();
  },
	methods: {
		sendMessage() {
      if (this.newMessage == '') { return; }
      ChatService.sendMessage({
        chatroomId: this.id,
        message: this.newMessage
      });
      this.newMessage = '';
    },
	},
}
</script>
