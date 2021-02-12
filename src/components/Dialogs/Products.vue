<template>
  <section>
    <v-dialog v-model="products.visible" max-width="800">
      <v-card flat tile>
        <v-toolbar
          height="35"
          dark
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
          <v-icon>mdi-webpack</v-icon>
          <span class="body-2 ml-3">Lipa Na M-PESA Products</span>
          <v-spacer />
          <v-icon size="18" class="ml-5" @click="products.visible = false"
            >mdi-close</v-icon
          >
        </v-toolbar>
        <div style="max-height: 75vh; overflow-y: auto; overflow-x: hidden">
          <v-row class="pl-8 pr-7 py-6">
            <v-col
              v-for="(product, i) in products.dataset"
              :key="i"
              cols="12"
              md="6"
            >
              <v-card
                class="elevation-0 px-5 pt-5 pb-4"
                style="border:1px solid #b2b2b2;"
              >
                <div class="font-weight-bold subtitle-1">
                  {{
                    product.product +
                      (product.alias.length > 0
                        ? " (" + product.alias + ")"
                        : "")
                  }}
                </div>
                <div class="mt-2 caption" v-html="product.description" />
                <div class="d-flex flex-row-reverse">
                  <v-btn
                    small
                    outlined
                    color="primary"
                    class="mt-3 mr-0"
                    @click="
                      GetCategories({
                        _: product._,
                        product: product.product
                      })
                    "
                    >APPLY</v-btn
                  >
                </div>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-card>
    </v-dialog>
    <Alert ref="Alert" />
  </section>
</template>

<script>
export default {
  props: ["products"],
  methods: {
    GetCategories(props) {
      this.promiseFetch(this.$store.getters.fetchTimeout)(
        fetch(this.$store.getters.endpoint + "Categories/", {
          method: "post",
          body: JSON.stringify({
            _: props._
          })
        })
      )
        .then(response => {
          if (response.status > 200) {
            this.$refs.Alert.Alertify({
              visible: true,
              content:
                "Oops, an issue occurred while attempting to fetch categories. Please try again.",
              title: "Server Error",
              icon: "mdi-progress-alert",
              color: "error"
            });
          } else {
            response.text().then(res => {
              this.products.categories.dataset = JSON.parse(res);
              this.products.categories.filter.cache = JSON.parse(res);
              this.products.product.selected = props.product;
              this.products.categories.visible = true;
            });
          }
        })
        .catch(() => {
          this.$refs.Alert.Alertify({
            visible: true,
            content: this.$store.getters.fetchTimeoutError,
            title: "Connection Timeout",
            icon: "mdi-wifi-strength-1-alert",
            color: "error"
          });
        });
    }
  }
};
</script>
