<template>
  <v-app class="gamepage">
    <Navbar />
    <main>
			<h1>Game</h1>
			<p>This is the GAME page</p>
	</main>
  </v-app>
</template>

<script>

import Navbar from '../components/Navbar.vue';

export default {
  name: 'App',
  components: { Navbar },
  data () {
    return {
      
    }
  }
}
</script>

<style scoped>

:root {
	--light: #600FDF;
	--light-purple: #4508A0;
	--medium-purple: #2B0366;
	--dark-purple: #1F024A;
	--dark-alt: #0F0124;
}
.gamepage{
  background: linear-gradient(var(--medium-purple), var(--light));
}

</style>