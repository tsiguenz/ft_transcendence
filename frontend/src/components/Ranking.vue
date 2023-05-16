<template>
  <p>{{ users }}</p>
<div class="rank">
      <figure class="ranking-2" >
    <v-avatar size="180px">
            <v-img
              class="same"
              src="/assets/icons/laurier2.png"
            ><ProfilePrintAvatar class="same1" :wdt="60" :hgt="60" :url-avatar="users.first"></ProfilePrintAvatar></v-img></v-avatar
          ><figcaption>#2<br>{{ users.first.nickname }}</figcaption></figure>
          <figure class="ranking-1" >
    <v-avatar size="200px">
            <v-img
              class="same"
              src="/assets/icons/laurier.png"
            ><ProfilePrintAvatar class="same1" :wdt="70" :hgt="70"></ProfilePrintAvatar></v-img>
            </v-avatar><figcaption>#1<br>{{ users }}</figcaption></figure>
            <figure class="ranking-3" >
          <v-avatar class="ranking-3" size="160px">
            <v-img
              class="same"
              src="/assets/icons/laurier3.png"
            ><ProfilePrintAvatar class="same1" :wdt="50" :hgt="50"></ProfilePrintAvatar></v-img></v-avatar>
            <figcaption>#3<br>{{ users }}</figcaption></figure></div>
</template>

<script>
import ProfilePrintAvatar from '../components/ProfilePrintAvatar.vue';

export default {
  components: {
    ProfilePrintAvatar
  },
  props: ['users'],
};
</script>

<style lang="scss" scoped>

.same{
  position: absolute;
}

.same1{
  position: absolute;
  margin-left: 40px;
}

.ranking-1{
  margin-right: auto;
  margin-left: auto;
  align-self: flex-end;
}

.ranking-2{
  margin-left: 20%;
  margin-bottom: 0;
  align-self: flex-end;
}

.ranking-3{
  margin-right: 20%;
  align-self: flex-end;
}

.rank{
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
  font-family:Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
}


</style>