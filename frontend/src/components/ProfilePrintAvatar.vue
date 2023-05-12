<template>
	<v-container flex>
		<v-row justify="center">
			<img :src="avatarPath" alt="avatar" class="rounded-pill" :width='wdth' :height='hgt' />
		</v-row>
	</v-container>
</template>

<script>
import axios from 'axios';
import * as constants from '@/constants.ts';
import swal from 'sweetalert';
import formatError from '@/utils/lib';
import { mapStores } from 'pinia';
import { useSessionStore } from '@/store/session';

export default {
    props: ['wdt', 'hgt'],
  data() {
    return {
      avatarPath: ''
		};
	},
  computed: {
    ...mapStores(useSessionStore)
  },
  async mounted() {
    await this.getAvatar();
  },
  methods: {
    async getAvatar() {
      try {
        const response = await axios.get(constants.API_URL + '/profile');
        this.avatarPath = constants.AVATARS_URL + response.data.avatarPath;
      } catch (error) {
        swal({
          icon: 'error',
          text: formatError(error.response.data.message)
        });
        this.$router.push('/logout');
      }
    }
	}
};
</script>