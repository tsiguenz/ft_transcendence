<template>
  <div class="app">
    <AppHeader></AppHeader>
    <div class="content-wrapper">
      <Navbar />
      <router-view />
    </div>
  </div>
</template>

<script>
import AppHeader from './components/AppHeader.vue';
import Navbar from './components/NavBar.vue';

export default {
  components: {
    AppHeader,
    Navbar
  },
  data() {
    return {};
  }
};

</script>

<style lang="scss">

@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500&display=swap');

* {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
}

body {
	background: linear-gradient(var(--medium-purple), var(--light));
}
button {
	cursor: pointer;
	appearance: none;
	border: none;
	outline: none;
	background: none;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
}


.app {
  display: flex;
  width: 100%;
	main {
		flex: 1 1 0;
		padding: 2rem;
	}
}

</style>