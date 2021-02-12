<template>
  <section>
    <v-dialog v-model="visible" max-width="350">
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
          <v-icon>mdi-account-circle</v-icon>
          <span class="body-2 ml-3">Login</span>
          <v-spacer />
          <v-icon size="18" class="ml-5" @click="Close">mdi-close</v-icon>
        </v-toolbar>
        <div
          class="pt-2 px-5 pb-0 CustomFormModifier"
          style="max-height: 75vh; overflow-y: auto; overflow-x: hidden"
        >
          <v-col cols="12" align="center" class="headline mb-2 py-3">
            <img width="80" :src="$store.getters.server + 'img/boat.png'" />
            <div class="mt-2 headline">Login</div>
            <div class="caption">
              {{
                phone.visible
                  ? "Please enter your phone number"
                  : "Please enter the OTP you received."
              }}
            </div>
          </v-col>
          <v-form ref="Login" @submit.prevent>
            <v-text-field
              v-if="phone.visible"
              v-model.trim="phone.value"
              v-mask="'##########'"
              :rules="[validators.required, validators.phone]"
              outlined
              label="Phone Number *"
              name="phone"
              prepend-inner-icon="mdi-deskphone"
              @keyup.enter="Login"
            >
              <template v-slot:append>
                <v-btn
                  color="primary"
                  style="margin-top: -6px"
                  :disabled="phone.value.length < 10 || loading.login"
                  :loading="loading.login"
                  @click="Login"
                  >LOGIN</v-btn
                >
              </template>
            </v-text-field>
          </v-form>
          <v-form ref="OTP" @submit.prevent>
            <v-text-field
              v-if="OTP.visible"
              v-model="OTP.value"
              v-mask="'####'"
              :rules="[validators.required, validators.OTP]"
              outlined
              label="OTP *"
              prepend-inner-icon="mdi-powershell"
              @keyup.enter="Validate"
            >
              <template v-slot:append>
                <v-btn
                  small
                  outlined
                  color="primary"
                  class="mr-2"
                  style="margin-top: -3px"
                  :disabled="loading.generate"
                  :loading="loading.generate"
                  @click="Generate"
                  >RESEND</v-btn
                >
                <v-btn
                  small
                  color="primary"
                  style="margin-top: -3px"
                  :disabled="OTP.value.length < 4 || loading.validate"
                  :loading="loading.validate"
                  @click="Validate"
                  >LOGIN</v-btn
                >
              </template>
            </v-text-field>
          </v-form>
          <img
            width="300"
            :src="$store.getters.server + 'img/_logo.png'"
            class="ml-3"
          />
        </div>
      </v-card>
    </v-dialog>
    <Alert ref="Alert" />
  </section>
</template>

<script>
export default {
  data() {
    return {
      visible: false,
      loading: {
        generate: false,
        validate: false,
        login: false
      },
      password: null,
      phone: {
        visible: true,
        value: ""
      },
      OTP: {
        visible: false,
        value: ""
      }
    };
  },
  methods: {
    Login() {
      this.loading.login = true;
      this.promiseFetch(this.$store.getters.fetchTimeout)(
        fetch(this.$store.getters.endpoint + "Login/", {
          method: "post",
          body: JSON.stringify({
            phone: this.phone.value
          })
        })
      )
        .then(response => {
          response.text().then(res => {
            if (response.status > 200) {
              this.$refs.Alert.Alertify({
                visible: true,
                content: res,
                title: "Generate Error",
                icon: "mdi-progress-alert",
                color: "error"
              });
            } else {
              this.phone.visible = false;
              this.OTP.visible = true;
              localStorage.token = res;
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
          this.loading.login = false;
        });
    },
    Validate() {
      this.loading.validate = true;
      this.promiseFetch(this.$store.getters.fetchTimeout)(
        fetch(this.$store.getters.endpoint + "OTP/Validate/", {
          method: "post",
          body: JSON.stringify({
            OTP: this.OTP.value,
            phone: this.phone.value
          })
        })
      )
        .then(response => {
          response.text().then(res => {
            if (response.status > 200) {
              this.$refs.Alert.Alertify({
                visible: true,
                content: res,
                title: "Invalid OTP",
                icon: "mdi-progress-alert",
                color: "error"
              });
            } else {
              localStorage._lnm_token = res;
              this.$router.push("/Applications");
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
          this.loading.validate = false;
        });
    },
    Generate() {
      this.loading.generate = true;
      this.promiseFetch(this.$store.getters.fetchTimeout)(
        fetch(this.$store.getters.endpoint + "OTP/Generate/", {
          method: "post",
          body: JSON.stringify({
            phone: this.phone.value
          })
        })
      )
        .then(response => {
          response.text().then(res => {
            if (response.status > 200) {
              this.$refs.Alert.Alertify({
                visible: true,
                content: res,
                title: "Generate Error",
                icon: "mdi-alert",
                color: "error"
              });
            } else {
              this.OTP.value = "";
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
          this.loading.generate = false;
        });
    },
    Close() {
      this.OTP.visible && ((this.OTP.value = ""), (this.phone.visible = true));
      this.phone.visible && (this.phone.value = "");
      this.visible = false;
    }
  }
};
</script>
