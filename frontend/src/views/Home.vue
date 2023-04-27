<template>
	<h1>Home</h1>
	<AppSignin />
	<AppSignup />
</template>

<script>
import AppSignin from '../components/AppSignin.vue';
import AppSignup from '../components/AppSignup.vue';
export default {
	components: {
		AppSignin,
		AppSignup
	},
  data() {
    return {
    };
  },
};
</script>
