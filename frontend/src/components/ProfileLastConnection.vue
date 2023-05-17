<template>
	<v-row class="justify-center"><h4 class="font">{{ disconnectSince }}</h4></v-row>
	<v-row class="justify-center"><p>Last connection</p></v-row>
</template>

<script>
export default {
	props: ['lastConnection'],
  data() {
    return {
			disconnectSince: ''
    };
  },
	mounted() {
		this.calculateDifference()
		setInterval(this.calculateDifference(), 1000)
	},
  methods: {
    async calculateDifference() {
console.log("this.lastConnection", this.lastConnection);
				const lastCoUTC = new Date(this.lastConnection).getTime();
				const nowUTC = new Date().getTime();
				this.disconnectSince = new Date(nowUTC - lastCoUTC).toISOString().slice(11, 19);
    }
  }
};
</script>

<style>
.font {
  font-family: 'Poppins', serif;
}
</style>
