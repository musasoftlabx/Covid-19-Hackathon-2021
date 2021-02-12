<template>
  <v-card tile class="elevation-15">
    <v-app-bar
      app
      fixed
      color="primary"
      dark
      clipped-left
      style="border-radius: 0"
      :src="$store.getters.server + 'img/backdrops/bg2.jpg'"
      class="elevation-20"
    >
      <template v-slot:img="{ props }">
        <v-img
          v-bind="props"
          gradient="to top right, rgba(39, 40, 39) 0%, rgb(56 166 171) 0%, rgba(39, 40, 39, 0.67) 100%"
        />
      </template>
      <template v-slot:extension>
        <v-tabs
          align-with-title
          dark
          color="yellow"
          slider-color="yellow"
          background-color="rgba(0,0,0,.1)"
          show-arrows
          center-active
          next-icon="mdi-chevron-right-box-outline"
          prev-icon="mdi-chevron-left-box-outline"
        >
          <v-tab to="/"> <v-icon left>mdi-home-account</v-icon>HOME </v-tab>
          <v-tab to="/Funding">
            <v-icon left>mdi-currency-usd</v-icon>Funding
          </v-tab>
          <v-tab to="/Expenditure">
            <v-icon left>mdi-face-mask</v-icon>Expenditure
          </v-tab>
          <v-tab to="/Corruption">
            <v-icon left>mdi-currency-usd-off</v-icon>Corruption
          </v-tab>
        </v-tabs>
      </template>
      <v-avatar color="primary" size="50" class="elevation-10">
        <span class="headline white--text">{{
          ComputeFirstName.substring(0, 1)
        }}</span>
      </v-avatar>
      <div class="ml-3">
        <div class="title font-weight-regular">
          Welcome,
          <span class="font-weight-bold">{{ ComputeFirstName }}</span>
        </div>
        <div class="caption mt-n1">
          {{ ComputeSignedIn }}
        </div>
      </div>
      <v-spacer />
      <div class="hidden-sm-and-up">
        <v-menu v-if="$store.getters.token" transition="fade-transition">
          <template v-slot:activator="{ on }">
            <v-btn x-large fab dark text color="white" v-on="on">
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item>
              <v-btn text>Logout</v-btn>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </v-app-bar>
  </v-card>
</template>
