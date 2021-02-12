export default {
  data() {
    return {
      LocalStorage: localStorage,
      textpass: false,
      validators: {
        required: value => !!value || "Required.",
        phone: value => (!!value && value.length === 10) || "Invalid number."
      }
    };
  },
  methods: {
    promiseFetch(msec) {
      return promise => {
        const timeout = new Promise((yea, nah) =>
          setTimeout(() => nah(new Error("Timeout expired")), msec)
        );
        return Promise.race([promise, timeout]);
      };
    },
    TextPass() {
      this.textpass = !this.textpass;
    }
  },
  computed: {
    Today() {
      let year = new Date().getFullYear();
      let month = "0" + parseInt(new Date().getMonth() + 1);
      let date = "0" + new Date().getDate();
      date = year + "-" + month.slice(-2) + "-" + date.slice(-2);
      return date;
    },
    Domain() {
      return JSON.parse(atob(localStorage.ccstoken.split(".")[1])).data.domain;
    },
    Role() {
      return JSON.parse(atob(localStorage.ccstoken.split(".")[1])).data.role;
    },
    ComputeFirstName() {
      if (this.$store.getters.token) {
        return JSON.parse(atob(this.$store.getters.token.split(".")[1])).data
          .FirstName;
      } else {
        return "Anonymous";
      }
    },
    ComputeLastName() {
      if (this.$store.getters.token) {
        return JSON.parse(atob(this.$store.getters.token.split(".")[1])).data
          .LastName;
      }
    },
    ComputeUsername() {
      if (this.$store.getters.token) {
        return JSON.parse(atob(this.$store.getters.token.split(".")[1])).data
          .username;
      }
    },
    ComputeSignedIn() {
      if (this.$store.getters.token) {
        return (
          "Signed in as " +
          JSON.parse(atob(this.$store.getters.token.split(".")[1])).data
            .username
        );
      } else {
        return "You are not signed in";
      }
    },
    ComputeEmailAddress() {
      if (this.$store.getters.token) {
        return JSON.parse(atob(this.$store.getters.token.split(".")[1])).data
          .EmailAddress;
      }
    },
    ComputeAvatar() {
      if (this.$store.getters.token) {
        return JSON.parse(atob(this.$store.getters.token.split(".")[1])).data
          .avatar;
      }
    }
  }
};
