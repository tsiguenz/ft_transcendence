<template>
  <div class="app">
    <AppHeader v-if="!hideHeader()"></AppHeader>
    <AppSidebar />
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
  },
  methods: {
    hideHeader() {
      return (
        this.$route.path === '/42/callback' ||
        this.$route.path === '/2fa/verify'
      );
    }
  }
};

</script>

<style lang="scss">

@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500&display=swap');

:root {
	--light: #600FDF;
	--light-purple: #4508A0;
	--medium-purple: #2B0366;
	--dark-purple: #1F024A;
	--dark-alt: #0F0124;
	--sidebar-width: 300px;
}

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
		@media (max-width: 1024px) {
			padding-left: 6rem;
		}
	}
}

</style>