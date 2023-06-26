<template>
  <div class="rank">
  
    <figure class="ranking-2" v-if="userLength >= 2">
      <v-avatar size="180px">
        <v-img class="same" src="/assets/icons/laurier2.png"
          ><ProfilePrintAvatar
            :wdt="60"
            :hgt="60"
            :url-avatar="avatarPath[1]"
          ></ProfilePrintAvatar></v-img
      ></v-avatar>
      <figcaption>
        #2<br />{{ users.second.nickname }}<br />
        <p class="points">{{ users.second.ladderPoints }}</p>
      </figcaption>
    </figure>
    <figure class="ranking-1" v-if="userLength >= 1">
      <v-avatar size="200px">
        <v-img class="same" src="/assets/icons/laurier.png"
          ><ProfilePrintAvatar
            :wdt="70"
            :hgt="70"
            :url-avatar="avatarPath[0]"
          ></ProfilePrintAvatar
        ></v-img>
      </v-avatar>
      <figcaption>
        #1<br />{{ users.first.nickname }}<br />
        <p class="points">{{ users.first.ladderPoints }}</p>
      </figcaption>
    </figure>
    <figure class="ranking-3" v-if="userLength >= 3">
      <v-avatar class="ranking-3" size="160px">
        <v-img class="same" src="/assets/icons/laurier3.png"
          ><ProfilePrintAvatar
            :wdt="50"
            :hgt="50"
            :url-avatar="avatarPath[2]"
          ></ProfilePrintAvatar></v-img
      ></v-avatar>
      <figcaption>
        #3<br />{{ users.third.nickname }}<br />
        <p class="points">{{ users.third.ladderPoints }}</p>
      </figcaption>
    </figure>
  </div>
</template>

<script>
import axios from 'axios';
import * as constants from '@/constants.ts';
import ProfilePrintAvatar from '../components/ProfilePrintAvatar.vue';

export default {
  components: {
    ProfilePrintAvatar
  },
  props: ['users', 'userLength'],
  data() {
    return {
      avatarPath: []
    };
  },
  async mounted() {
    console.log(this.userLength);
    await this.getUsersAvatarPath();
  },
  methods: {
    async getUsersAvatarPath() {
      if (this.userLength >= 1)
        this.avatarPath[0] = constants.AVATARS_URL + this.users.first.avatarPath;
      if (this.userLength >= 2)
        this.avatarPath[1] = constants.AVATARS_URL + this.users.second.avatarPath;
      if (this.userLength >= 3)
        this.avatarPath[2] = constants.AVATARS_URL + this.users.third.avatarPath;
    }
  }
};
</script>

<style lang="scss" scoped>
.same {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 15%;
}
.ranking-1 {
  margin-right: auto;
  margin-left: auto;
  align-self: flex-end;
}

.ranking-2 {
  margin-left: 20%;
  margin-bottom: 0;
  align-self: flex-end;
}

.ranking-3 {
  margin-right: 20%;
  align-self: flex-end;
}

.rank {
  display: flex;
  justify-content: center;
}

figure {
  display: table;
}

figcaption {
  display: table-caption;
  caption-side: users;
  font-size: 40px !important;
  text-align: center;
  font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
}

.points {
  font-size: medium;
}
</style>
