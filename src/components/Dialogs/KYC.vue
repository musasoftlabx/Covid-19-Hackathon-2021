<template>
  <v-dialog
    v-model="products.KYC.visible"
    max-width="700"
    transition="slide-x-transition"
  >
    <v-card>
      <v-toolbar
        height="35"
        dark
        color="primary"
        :src="
          $store.getters.server + 'img/backdrops/' + $store.getters.background
        "
      >
        <template v-slot:img="{ props }">
          <v-img
            v-bind="props"
            gradient="to top right, rgba(0, 171, 36, .9), rgba(34, 66, 18, .7)"
          />
        </template>
        <v-icon size="18" class="mt-n1">mdi-book-open-page-variant</v-icon>
        <span class="body-2 ml-2" style="margin-top: 1px">
          {{ products.product.selected }}
        </span>
        <div v-if="$vuetify.breakpoint.mdAndUp">
          <v-icon>mdi-circle-small</v-icon>
          <span class="body-2 yellow--text" style="margin-top: 1px">
            {{ products.categories.selected }}
          </span>
          <span v-if="products.categories.CategoryObject.description">
            <v-icon>mdi-circle-small</v-icon>
            <span
              class="body-2 light-green--text text--accent-2"
              style="margin-top: 1px; max-width: 0; white-space: nowrap; display: inline-block;"
              >{{ products.categories.CategoryObject.description }}</span
            >
          </span>
        </div>
        <v-spacer />
        <v-icon size="20" class="ml-5" @click="products.KYC.visible = false"
          >mdi-close</v-icon
        >
      </v-toolbar>
      <div class="mx-3">
        <div style="max-height: 75vh; overflow-y: auto; overflow-x: hidden;">
          <div class="pt-6 pb-2 px-5">
            <div class="font-weight-bold body-2 mb-4">
              To apply for {{ products.categories.selected }}, you will need to
              submit the below documents
            </div>
            <div
              v-for="(KYC, i) in products.KYC.KYCs"
              :key="i"
              v-html="i + 1 + '. ' + KYC.KYC"
              class="body-2 font-weight-regular mb-2 ml-2"
            />
          </div>
          <div class="d-flex flex-row-reverse mt-2 px-3 pb-4">
            <v-btn
              color="primary"
              class="ml-4"
              :loading="loading"
              :disabled="loading"
              @click="Next"
              >APPLY</v-btn
            >
            <v-btn
              outlined
              color="primary"
              @click="products.KYC.visible = false"
              >CLOSE</v-btn
            >
          </div>
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: ["products"],
  data() {
    return {
      loading: false
    };
  },
  methods: {
    Next() {
      this.products.KYC.visible = false;
      this.products.categories.visible = false;
      this.products.product.visible = true;
    }
  }
};
</script>
