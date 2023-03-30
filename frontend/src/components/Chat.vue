<template>
	<v-list ref="chat" height="1000" class="overflow-y-auto">
	  <v-list-subheader>{{ title }}</v-list-subheader>
	  <div v-for="item in messages" :key="item.data">
	    <p class="text-right ma-2" ><a v-if="item.author === 'Me'" class="rounded-pill pa-1 bg-blue">{{item.data }}</a></p>
	    <p class="text-left ma-2"><a v-if="item.author !== 'Me'" class="rounded-pill pa-1 bg-green" >{{ item.author }}: {{item.data }}</a></p>
	  </div>
	</v-list>
</template>

<script>
export default {
	data() {
    return {}
  },
  props: [
  	'id',
  	'title',
  	'messages'
  ],
  watch: {
	  messages: {
	    handler(_val, _oldVal) {
    		this.$nextTick(() => {
					this.$refs.chat.$el.scrollTop = this.$refs.chat.$el.scrollHeight;
				});
	    },
	    deep: true
	  },
	}
}
</script>
