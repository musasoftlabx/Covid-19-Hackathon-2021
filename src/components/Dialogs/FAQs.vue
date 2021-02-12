<template>
  <v-dialog
    v-model="visible"
    :fullscreen="fullscreen"
    :max-width="!fullscreen ? 900 : 0"
    :hide-overlay="fullscreen"
    transition="slide-x-transition"
  >
    <v-card flat tile color="grey lighten-1">
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
            gradient="to top right, rgba(0, 171, 36, .9), rgba(34, 66, 18, .7)"
          />
        </template>
        <v-icon>mdi-help-box</v-icon>
        <span class="subtitle-1 mt-1 ml-3">Frequently Asked Questions</span>
        <v-spacer />
        <v-icon
          size="20"
          @click="fullscreen ? (fullscreen = false) : (fullscreen = true)"
        >
          {{ fullscreen ? "mdi-window-restore" : "mdi-window-maximize" }}
        </v-icon>
        <v-icon size="20" class="ml-5" @click="visible = false"
          >mdi-close</v-icon
        >
      </v-toolbar>
      <div
        :style="
          fullscreen
            ? 'max-height: 90vh; overflow-y: auto; overflow-x: hidden'
            : 'max-height: 75vh; overflow-y: auto; overflow-x: hidden'
        "
      >
        <v-tabs
          v-model="tab"
          dark
          color="yellow"
          slider-color="yellow"
          background-color="primary"
          show-arrows
          center-active
          next-icon="mdi-chevron-right-box-outline"
          prev-icon="mdi-chevron-left-box-outline"
        >
          <v-tab
            v-model="tab"
            text
            tile
            small
            v-for="(product, i) in UniqueProducts"
            :ref="'Product ' + i"
            :key="i"
            @click="ChangeProductTo(product)"
          >
            <v-icon left>mdi-webpack</v-icon>
            <span>{{ product }}</span>
          </v-tab>
        </v-tabs>
        <v-tabs-items v-model="tab" class="grey lighten-1 pb-3">
          <v-card flat tile dark color="primary">
            <v-text-field
              v-model="search.query"
              clearable
              solo-inverted
              hide-details
              prepend-inner-icon="mdi-magnify"
              label="Search"
              class="mb-3"
            />
          </v-card>
          <v-tab-item v-for="(product, i) in UniqueProducts" :key="i">
            <v-expansion-panels popout>
              <v-expansion-panel
                v-for="(FAQ, i) in search.results.length === 0 && !search.query
                  ? filtrate
                  : search.results"
                :key="i"
              >
                <v-expansion-panel-header
                  class="font-weight-bold primary--text"
                  >{{ FAQ.question }}</v-expansion-panel-header
                >
                <v-expansion-panel-content>
                  <div
                    class="caption"
                    v-html="FAQ.answer"
                    style="width: 100%;"
                  />
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
            <v-row
              v-if="search.results.length === 0 && search.query"
              justify="center"
            >
              <span>No results found</span>
            </v-row>
          </v-tab-item>
        </v-tabs-items>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: ["FAQs"],
  data() {
    return {
      tab: 0,
      visible: false,
      fullscreen: false,
      loading: false,
      search: {
        query: "",
        results: []
      },
      dataset: [],
      filtrate: []
    };
  },
  watch: {
    "search.query"(n) {
      if (n) {
        this.search.results = this.filtrate.filter(
          o => o.question.toLowerCase().indexOf(n.toLowerCase()) > -1
        );
      } else {
        this.search.results = [];
      }
    }
  },
  methods: {
    GetFAQs() {
      this.loading = true;
      this.promiseFetch(this.$store.getters.fetchTimeout)(
        fetch(this.$store.getters.endpoint + "FAQs/")
      )
        .then(response => {
          response.text().then(res => {
            if (response.status > 200) {
              this.$refs.Alert.Alertify({
                visible: true,
                content: res,
                title: "Request Failed!",
                icon: "mdi-alert-decagram-outline",
                color: "error"
              });
            } else {
              this.dataset = JSON.parse(res);
              this.filtrate = JSON.parse(res);
              this.visible = true;
              this.ChangeProductTo("M-PESA Business Till");
            }
          });
        })
        .catch(() => {
          this.$refs.Alert.Alertify({
            visible: true,
            content: this.$store.getters.fetchTimeoutError,
            title: "Connection Timeout",
            icon: "mdi-wifi-strength-1-alert",
            color: "error"
          });
        })
        .finally(() => {
          this.loading = false;
        });
    },
    ChangeProductTo(product) {
      this.filtrate = this.dataset.filter(o => o.product === product);
    }
  },
  computed: {
    UniqueProducts() {
      return [...new Set(this.dataset.map(o => o.product))];
    }
  }
};
</script>
