import formatError from '../utils/lib';
<template>
    <nav>
      <v-toolbar class="nav">
        <v-toolbar-title>
          <span class="title">{{ pageTitle }}</span>
        </v-toolbar-title>
      </v-toolbar>
    </nav>
  </template>
  
  <script>
  export default {
  computed: {
    pageTitle() {
      return this.$route.name || 'Default Title';
    }
  }
};
  </script>
  
<style scoped>

:root {
	--light: #600FDF;
	--light-purple: #4508A0;
	--medium-purple: #2B0366;
	--dark-purple: #1F024A;
	--dark-alt: #0F0124;
}

.nav{
    background: #0F0124;
}

.title{
    font-weight: 500;
    font-size: larger;
    display: flex;
    justify-content: center;
}

</style>