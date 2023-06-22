<template>
   <v-row class="row" no-gutters>
    <v-col class="allcol textcol" cols="6"><h1>LET THE <br>PONG BEGIN !</h1>
    <p>Welcome to our game, an exciting new Pong game created by four students of 42 PARIS in full stack development.</p>
    <p>We’ve created a thriving community where you can connect with other players, make new friends, and compete against each other in real-time.
    </p> <br><p class="text">So why wait? Play our Pong game, chat with other players, and climb the leaderboard to become the ultimate Pong champion.</p>
        
    <div v-if="!isLog()" class="button-group sign-btn">
          <SignCard :to-signin="true" />
          <SignCard />
      </div>
    <router-link v-else to="/game"><v-btn class="log play">Play</v-btn></router-link>
    </v-col>
    <v-col cols="6" class="allcol game">
      <video width="600"  autoplay loop muted>
        <source src="../../assets/pong.mp4" type="video/mp4" />
      </video></v-col></v-row>
</template>

<script>
import SignCard from '../components/SignCard.vue';
import { mapStores } from 'pinia';
import { useSessionStore } from '@/store/session';

export default {
  components: {
    SignCard
  },
  data() {
    return {
      users: [],
      search: ''
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

<style>

.row{
  padding-left: 20px;
  padding-right: 20px;
}
.allcol{
  height: auto;
  margin-top: auto;
  margin-bottom: auto;
}

.textcol h1{
  font-size: 80px;
  line-height: 1em;
}

.sign-btn{
  width: 320px;
  height: 40px;
  margin-left: 0 !important;
}
.text {
  margin-bottom: 10px;
  font-weight: bold;
}

.game  {
  display: flex;
  justify-content: center;
}

.game img{
  width: 600px;
  height: auto;
}

.play{
  width: 100px;
 
}

</style>
