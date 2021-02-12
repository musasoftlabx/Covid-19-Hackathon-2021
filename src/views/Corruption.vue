<template>
  <section>
    <Appbar />
    <NoContent v-if="NoContent.visible" :NoContent="NoContent" />

    <Alert ref="Alert" />
  </section>
</template>

<script>
import Appbar from "@/components/Appbar";
import NoContent from "@/components/NoContent";
export default {
  /*  beforeRouteEnter(to, from, next) {
    !localStorage.daraja ? next(from.fullPath) : next();
  }, */
  components: {
    Appbar,
    NoContent
  },
  data() {
    return {
      NoContent: {
        visible: true,
        loading: false
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
    this.NoContent.visible = true;
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
