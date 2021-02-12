<template>
  <section>
    <Appbar />
    <NoContent v-if="NoContent.visible" :NoContent="NoContent" />
    <div v-else style="background: #e4e4e4">
      <Funding ref="Funding" />
      <v-container fluid :class="$vuetify.breakpoint.smAndUp && 'px-12'">
        <v-row justify="center">
          <v-col cols="12" sm="12">
            <v-data-iterator
              :items="dataset"
              :items-per-page.sync="itemsPerPage"
              :page="page"
              :search="search"
              hide-default-footer
              no-data-text=""
            >
              <template v-slot:header>
                <div>
                  <h3 class="mt-2 mb-4">
                    Funding<v-chip
                      small
                      text-color="white"
                      color="blue"
                      class="ml-2 subtitle-1"
                      ><span>{{ dataset.length }}</span></v-chip
                    >
                  </h3>
                  <div v-if="dataset.length >= 6">
                    <v-row>
                      <v-col cols="12" sm="3">
                        <v-text-field
                          v-model="search"
                          clearable
                          flat
                          outlined
                          hide-details
                          dense
                          prepend-inner-icon="mdi-table-search"
                          label="Search"
                        />
                      </v-col>
                      <v-spacer />
                      <v-col align="end" cols="12" sm="4">
                        <span class="mr-4 grey--text"
                          >Page {{ page }} of {{ numberOfPages }}</span
                        >
                        <v-btn
                          fab
                          dark
                          small
                          color="primary"
                          class="mr-1"
                          @click="formerPage"
                        >
                          <v-icon>mdi-chevron-left</v-icon>
                        </v-btn>
                        <v-btn
                          fab
                          dark
                          small
                          color="primary"
                          class="ml-1"
                          @click="nextPage"
                        >
                          <v-icon>mdi-chevron-right</v-icon>
                        </v-btn>
                      </v-col>
                    </v-row>
                    <v-row no-gutters align="center">
                      <span class="grey--text">Fundings per page</span>
                      <v-menu offset-y>
                        <template v-slot:activator="{ on }">
                          <v-btn
                            dark
                            text
                            color="primary"
                            class="ml-2"
                            v-on="on"
                          >
                            {{ itemsPerPage }}
                            <v-icon>mdi-chevron-down</v-icon>
                          </v-btn>
                        </template>
                        <v-list>
                          <v-list-item
                            v-for="(number, index) in itemsPerPageArray"
                            :key="index"
                            @click="updateItemsPerPage(number)"
                          >
                            <v-list-item-title>{{ number }}</v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </v-row>
                  </div>
                </div>
              </template>

              <template v-slot:no-data
                ><v-row no-gutters justify="center" class="mt-10">
                  <v-alert
                    text
                    outlined
                    color="deep-orange"
                    icon="mdi-progress-alert"
                  >
                    Mmmmh...looks like you don't have any apps currently
                  </v-alert>
                </v-row>
              </template>

              <template v-slot:default="props">
                <section v-if="skeleton">
                  <v-row>
                    <v-col
                      v-for="i in 12"
                      :key="i"
                      cols="12"
                      sm="6"
                      md="4"
                      lg="3"
                      xl="2"
                    >
                      <v-skeleton-loader type="image, article" />
                    </v-col>
                  </v-row>
                </section>
                <section v-else>
                  <v-row v-masonry>
                    <v-col
                      v-for="(item, i) in props.items"
                      :key="item.title"
                      cols="12"
                      sm="12"
                      md="6"
                      lg="3"
                      xl="3"
                    >
                      <v-card class="elevation-3">
                        <v-card
                          tile
                          flat
                          dark
                          style="
                        linear-gradient(60deg, rgba(2, 155, 64, 0.9) 0%, rgb(101, 161, 86) 55%, rgba(106, 213, 122, 0.95) 100%)'
                      "
                        >
                          <v-img
                            style="padding-right: 20px"
                            height="150px"
                            src="https://cdn.pixabay.com/photo/2020/07/12/07/47/bee-5396362_1280.jpg"
                            gradient="to top right, rgba(100,115,201,.33), rgba(25,32,72,.7)"
                            @load="$redrawVueMasonry()"
                          >
                            <v-card-title class="white--text mt-2">
                              <v-row no-gutters>
                                <v-spacer />
                                <v-col cols="11">
                                  <div
                                    class="text-truncate"
                                    style="max-width: 80%"
                                  >
                                    {{ item.donor }}
                                  </div>
                                  <v-chip
                                    label
                                    outlined
                                    small
                                    class="mt-0"
                                    style="border: 1px solid #fff"
                                    >Amount: KSh
                                    {{ item.amount.toLocaleString() }}</v-chip
                                  >
                                  <v-chip-group
                                    column
                                    active-class="primary--text"
                                  >
                                    <span
                                      class="text-body-2 mr-1"
                                      style="margin-top: 6px"
                                      >Categories:</span
                                    >
                                    <v-chip
                                      v-for="(category, i) in item.categories"
                                      :key="i"
                                      label
                                      small
                                      color="#5c933e"
                                      text-color="white"
                                      >{{ category }}</v-chip
                                    >
                                  </v-chip-group>
                                </v-col>
                              </v-row>
                            </v-card-title>
                          </v-img>
                          <img
                            v-if="i < 2"
                            style="position: absolute; left: -8px; top: -8px"
                            :src="
                              $store.getters.server + 'img/CornerRibbon.png'
                            "
                            width="100px"
                            height="100px"
                          />
                          <!--  <v-row>
                          <v-col cols="12" align="center" justify="center">
                            <div class="title font-weight-thin yellow--text">
                              {{ item.title }}
                            </div>
                          </v-col>
                        </v-row> -->
                        </v-card>
                        <v-card tile flat class="px-5 pt-2">
                          <div v-if="item.counties.length > 0">
                            <div class="font-weight-bold text-body-2 ml-8">
                              Counties
                            </div>
                            <v-timeline align-top dense>
                              <v-timeline-item
                                v-for="(county, c) in item.counties"
                                :key="c"
                                small
                              >
                                <div class="text-caption">{{ county }}</div>
                              </v-timeline-item>
                            </v-timeline>
                          </div>

                          <div class="text-caption mt-3">
                            <span class="font-weight-bold"
                              >Description:&nbsp;</span
                            >
                            {{ item.description }}
                          </div>
                          <v-card-actions
                            ><v-spacer />
                            <v-btn
                              :href="item.article_link"
                              target="_blank"
                              color="blue"
                              text
                            >
                              VISIT ARTICLE
                            </v-btn>
                          </v-card-actions>
                        </v-card>
                      </v-card>
                    </v-col>
                  </v-row>
                </section>
              </template>
            </v-data-iterator>
          </v-col>
        </v-row>
      </v-container>
    </div>
    <Alert ref="Alert" />
  </section>
</template>

<script>
import Appbar from "@/components/Appbar";
import NoContent from "@/components/NoContent";
import Funding from "@/components/Funding";
//import Expenditures from "@/components/Dashboard/Expenditures";
import funding from "@/api/funding";
export default {
  /*  beforeRouteEnter(to, from, next) {
    !localStorage.daraja ? next(from.fullPath) : next();
  }, */
  components: {
    Appbar,
    NoContent,
    Funding
  },
  data() {
    return {
      NoContent: {
        visible: true,
        loading: true
      },
      apps: false,
      skeleton: false,
      headers: [],
      dataset: [],
      companies: [],
      company: null,
      itemsPerPageArray: [12, 24, 36],
      search: "",
      filter: {},
      sortDesc: false,
      page: 1,
      itemsPerPage: 12,
      sortBy: "no"
    };
  },
  created() {
    this.NoContent.visible = false;
    this.dataset = funding;
    /* this.dataset.length === 0 ? (this.apps = false) : (this.apps = true);
    setTimeout(() => {
      this.skeleton = false;
    }, 1000); */
  },
  methods: {
    nextPage() {
      if (this.page + 1 <= this.numberOfPages) this.page += 1;
    },
    formerPage() {
      if (this.page - 1 >= 1) this.page -= 1;
    },
    updateItemsPerPage(number) {
      this.itemsPerPage = number;
    },
    NewApp(dataset) {
      this.dataset.unshift(dataset);
      this.$router.push("Reloader");
      this.$router.back();
    }
  },
  computed: {
    numberOfPages() {
      return Math.ceil(this.dataset.length / this.itemsPerPage);
    },
    filteredKeys() {
      return this.headers.filter(key => key !== `Name`);
    }
  }
};
</script>

<style>
html {
  overflow: auto;
}
.CustomVerticalTable thead th {
  border-top: 1px solid #7a7a7a;
  border-bottom: 1px solid #7a7a7a !important;
}
.CustomVerticalTable tbody td {
  border-bottom: 1px solid #7a7a7a;
}
.CustomVerticalTable td,
.CustomVerticalTable th {
  border-right: 1px solid #7a7a7a;
}
.CustomVerticalTable td:first-child,
.CustomVerticalTable th:first-child {
  border-left: 1px solid #7a7a7a;
}
</style>
