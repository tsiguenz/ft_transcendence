<template>
	<aside :class="`${is_expanded ? 'is-expanded' : ''}`">
		
		<div class="logo"><img to="/home" src="../../icons/pong.png"></div>

		<div class="menu-toggle-wrap">
			<button class="menu-toggle" @click="ToggleMenu">
				<span class="material-icons">keyboard_double_arrow_right</span>
			</button>
		</div>
		<div class="menu">
			<router-link class="button" to="/home"><v-avatar  rounded="0" size="25px">
						<v-img  class="icons-avatar" src="./icons/house.png"></v-img></v-avatar><span class="text">Home</span></router-link>
			<router-link v-if="isLog()" class="button" to="/game"><v-avatar  rounded="0" size="25px">
						<v-img  class="icons-avatar" src="./icons/joystick.png"></v-img></v-avatar><span class="text">Game</span></router-link>
			<router-link v-if="isLog()" class="button" to="/chat"><v-avatar  rounded="0" size="25px">
						<v-img  class="icons-avatar" src="./icons/chat.png"></v-img></v-avatar><span class="text">Chat</span></router-link>
			<router-link v-if="isLog()" class="button" to="/friends"><v-avatar  rounded="0" size="25px">
						<v-img  class="icons-avatar" src="./icons/friends.png"></v-img></v-avatar><span class="text">Social</span></router-link>
			<router-link v-if="isLog()" class="button" to="/leaderboard"><v-avatar  rounded="0" size="25px">
						<v-img  class="icons-avatar" src="./icons/trophy.png"></v-img></v-avatar><span class="text">LeaderBoard</span></router-link>
			<router-link v-if="isLog()" class="button" to="/profile"><v-avatar  rounded="0" size="25px">
						<v-img  class="icons-avatar" src="./icons/user.png"></v-img></v-avatar><span class="text">Profile</span></router-link>
		</div>
</aside>
</template>

<script>
import { mapStores } from 'pinia';
import { useSessionStore } from '@/store/session';

export default {
	data() {
		return {
			drawer: true
		};
	},
	computed: {
		...mapStores(useSessionStore)
	},
	methods: {
		isLog() {
			return this.sessionStore.loggedIn;
		}
	}
};
</script>

<script setup>

import { ref } from 'vue';

const is_expanded = ref(false)
const ToggleMenu = () => {
	is_expanded.value = !is_expanded.value;
}
</script>
<style lang="scss" scoped>

:root {
	--light: #600FDF;
	--light-purple: #4508A0;
	--medium-purple: #2B0366;
	--dark-purple: #1F024A;
	--dark-alt: #0F0124;
	--sidebar-width: 300px;
}

aside {
	display: flex;
	flex-direction: column;
	background-color: var(--dark-alt);
	color: #ffff;
	width: calc(2rem + 32px);
	overflow: hidden;
	min-height: 100vh;
	padding: 1rem;
	transition: 0.2s ease-in-out;

	font-family: 'Poppins', sans-serif;
	.logo {
		margin-bottom: 1rem;
		img {
			width: 2rem;
		}
	}

	.button:hover{
		background-color: #600FDF;
	}
	.menu-toggle-wrap {
		display: flex;
		justify-content: flex-end;
		margin-bottom: 1rem;
		position: relative;
		top: 0;
		transition: 0.2s ease-in-out;
		.menu-toggle {
			transition: 0.2s ease-in-out;
		}
	}

	&.is-expanded {
		width: var(--sidebar-width);

		.menu-toggle-wrap {
			top: -3rem;
			
			.menu-toggle {
				transform: rotate(-180deg);
			}
		}
	}

	.menu {
		margin: 0 -1rem;
		.button {
			display: flex;
			align-items: center;
			text-decoration: none;
			transition: 0.2s ease-in-out;
			padding: 0.5rem 1rem;
			.text {
				padding-left: 2rem;
				color: var(--light);
				transition: 0.2s ease-in-out;
			}
			&:hover {
				background-color: var(--dark-alt);
				.button, .text {
					color: var(--primary);
				}
			}

			&.router-link-exact-active {
				background-color: var(--dark-purple);
				border-right: 5px solid var(--light);
				.icons-avatar, .text {
					color: var(--primary);
				}
			}
		}
	}
}
</style>