<template>
  <section>
    <v-dialog v-model="visible" max-width="800" transition="slide-y-transition">
      <v-card flat tile>
        <v-toolbar
          height="50"
          dark
          color="primary"
          :src="
            $store.getters.server + 'img/backdrops/' + $store.getters.background
          "
        >
          <template v-slot:img="{ props }">
            <v-img
              v-bind="props"
              gradient="to top right, rgba(57,181,74,.9), rgba(25,32,72,.6)"
            />
          </template>
          <v-icon>mdi-book-open-outline</v-icon>
          <span class="subtitle-1 mt-1 ml-3">Terms &amp; Conditions</span>
          <v-spacer />
          <v-icon size="20" class="ml-5" @click="visible = false"
            >mdi-close</v-icon
          >
        </v-toolbar>
        <div
          :style="
            fullscreen
              ? 'max-height: 90vh; overflow-y: auto'
              : 'max-height: 75vh; overflow-y: auto'
          "
        >
          <v-layout
            column
            color="white"
            pa-5
            v-html="products.formdata.TermsAndConditions"
            height="1000"
          />
        </div>
      </v-card>
    </v-dialog>
    <v-divider />
    <v-row
      align="center"
      no-gutters
      :class="$vuetify.breakpoint.xsOnly ? 'mt-5 mb-8' : false"
    >
      <v-col cols="2" sm="1">
        <v-checkbox
          v-model="agreed"
          color="primary"
          :rules="[validators.required]"
        />
      </v-col>
      <v-col
        cols="10"
        sm="11"
        style="margin-top: -2px"
        :class="$vuetify.breakpoint.xsOnly ? false : 'ml-n5'"
      >
        <span class="subtitle-2">
          I accept Safaricom's
          <v-chip
            @click="visible = true"
            outlined
            small
            label
            color="primary"
            class="ml-1 mr-2"
            >Terms &amp; Conditions</v-chip
          >concerning this application
        </span>
      </v-col>
    </v-row>
  </section>
</template>

<script>
export default {
  props: ["products", "TermsAndConditions"],
  data() {
    return {
      agreed: false,
      visible: false,
      fullscreen: false,
      content: null
    };
  }
};
</script>
