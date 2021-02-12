<template>
  <v-dialog
    v-model="products.categories.visible"
    transition="slide-y-transition"
    max-width="900"
    style="overflow: hidden !important"
  >
    <v-card class="px-8 py-3" style="border-top: 3px solid #39b54a;">
      <v-row dense class="pb-2">
        <v-col cols="10" md="4">
          <div class="title font-weight-bold">Categories under</div>
          <div class="subtitle-2 primary--text">
            {{ products.product.selected }}
          </div>
          <v-text-field
            v-if="products.categories.filter.cache.length > 5"
            v-model="products.categories.filter.filtrate"
            append-icon="mdi-magnify"
            label="Filter categories"
            single-line
            hide-details
            outlined
            clearable
            dense
            class="mt-3"
            @click:clear="products.categories.filter.filtrate = ''"
          />
        </v-col>
        <v-spacer />
        <v-btn icon @click="products.categories.visible = false" class="mt-2">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-row>
      <div style="max-height: 60vh; overflow-y: auto; overflow-x: hidden">
        <v-row v-if="products.categories.dataset.length > 0">
          <v-col
            cols="auto"
            v-for="(category, i) in products.categories.dataset"
            :key="i"
          >
            <v-card
              ripple
              flat
              :small="$vuetify.breakpoint.xsOnly"
              class="py-1 pl-3 pr-5"
              style="border: 1px solid #39b54a;"
              @click="
                MapKYC({
                  CategoryObject: category,
                  category: category.category,
                  KYCs: category.KYCs,
                  prefix: category.prefix
                })
              "
            >
              <v-icon color="primary">mdi-content-duplicate</v-icon>
              <div class="pl-1 mt-1 body-2 font-weight-bold">
                {{ category.category }}
              </div>
              <div class="pl-1 caption">{{ category.description }}</div>
            </v-card>
          </v-col>
        </v-row>
        <span v-else class="body-2"
          >No categories based on your search were found</span
        >
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: ["products"],
  watch: {
    "products.categories.filter.filtrate"(n) {
      if (n) {
        this.products.categories.dataset = this.products.categories.filter.cache.filter(
          e => {
            return e.category.toLowerCase().indexOf(n.toLowerCase()) > -1;
          }
        );
      } else {
        this.products.categories.dataset = this.products.categories.filter.cache;
      }
    }
  },
  methods: {
    MapKYC(props) {
      this.products.categories.selected = props.category;
      this.products.categories.CategoryObject = props.CategoryObject;
      this.products.KYC.prefix = props.prefix;
      this.products.KYC.KYCs = props.KYCs;
      this.products.KYC.visible = true;
    }
  }
};
</script>
