<template>
  <section>
    <v-dialog
      v-model="visible"
      :fullscreen="fullscreen"
      :max-width="!fullscreen ? 800 : 0"
      :hide-overlay="fullscreen"
      persistent
      transition="slide-y-transition"
    >
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
          <v-icon size="18">mdi-file-image</v-icon>
          <span class="body-2 ml-2">Attachments</span>
          <v-spacer />
          <v-icon
            size="18"
            @click="fullscreen ? (fullscreen = false) : (fullscreen = true)"
          >
            {{ fullscreen ? "mdi-window-restore" : "mdi-window-maximize" }}
          </v-icon>
          <v-icon size="18" class="ml-5" @click="CloseAttachments"
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
          <v-card flat>
            <v-container class="px-8">
              <v-row id="attachments">
                <v-col
                  cols="12"
                  sm="6"
                  v-for="(attachment, i) in products.KYC.KYCs"
                  :key="i"
                  class="mb-3"
                  style="z-index:0"
                >
                  <div class="mb-2">
                    <v-icon class="title mt-n1 mr-2">mdi-file-image</v-icon>
                    <span
                      class="body-2 font-weight-bold"
                      v-html="attachment.KYC"
                    />
                  </div>
                  <v-card
                    flat
                    class="px-2 pt-4"
                    style="background-color:#efefef;border:2px dashed #BDBDBD !important; border-radius:5px"
                  >
                    <input
                      :id="attachment.prefix"
                      :ref="i"
                      type="file"
                      name="attachment"
                    />
                  </v-card>
                </v-col>
              </v-row>
            </v-container>
          </v-card>
        </div>
      </v-card>
    </v-dialog>
    <Alert ref="Alert" />
    <Progress ref="Progress" />
    <Confirm
      ref="Confirm"
      @confirm="Confirm({ task: true })"
      @cancel="Confirm({ task: false })"
    />
  </section>
</template>

<script>
import Progress from "@/components/Dialogs/Progress";
export default {
  components: {
    Progress
  },
  props: ["products", "ApplicationID"],
  data() {
    return {
      visible: false,
      fullscreen: false,
      loading: false,
      URL: null,
      uploads: []
    };
  },
  watch: {
    uploads(n) {
      if (n.length == this.products.KYC.KYCs.length) {
        this.CreateSharepointListItem();
      }
    }
  },
  methods: {
    CreateSharepointListItem() {
      this.$refs.Progress.Progressify({
        visible: true,
        content: "Finishing up...please wait!"
      });
      this.promiseFetch(60000)(
        fetch(
          this.$store.getters.endpoint +
            "Applications/Products/" +
            this.products.product.selected.replace(/\s+/g, "") +
            "/CreateSharepointListItem/",
          {
            method: "post",
            body: JSON.stringify({
              _: this.ApplicationID
            })
          }
        )
      )
        .then(response => {
          response.text().then(res => {
            if (response.status > 200) {
              this.$refs.Alert.Alertify({
                visible: true,
                content: res,
                title: "Submission Failed!",
                icon: "mdi-alert-decagram-outline",
                color: "error"
              });
            } else {
              this.Confirm({
                task: "show",
                color: "primary",
                icon: "mdi-check-decagram",
                content: res,
                title: "Application Complete!",
                truth: "OK",
                falsy: "HIDDEN"
              });
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
          this.$refs.Progress.Progressify({
            visible: false
          });
          this.RemoveAttachments();
        });
    },
    Confirm(props) {
      if (props.task == "show") {
        this.$refs.Confirm.Confirmify({
          visible: true,
          operation: props.operation,
          metadata: props.metadata,
          content: props.content,
          title: props.title,
          icon: props.icon || "mdi-help-circle",
          color: props.color || "orange",
          truth: props.truth || "YES",
          falsy: props.falsy || "NO"
        });
      } else if (props.task) {
        this.$refs.Confirm.Confirmify({
          visible: false
        });
        this.RemoveAttachments();
        this.$refs.Alert.Alertify({
          visible: false
        });
        this.$router.push("/_/_");
      } else if (!props.task) {
        this.$refs.Confirm.Confirmify({
          visible: false
        });
      }
    },
    CloseAttachments() {
      new Promise(resolve => {
        resolve(this.RemoveAttachments());
      }).then(() => {
        this.visible = false;
      });
    },
    RemoveAttachments() {
      let countdown = setInterval(() => {
        this.uploads.forEach((object, i) => {
          document
            .getElementsByClassName("filepond--action-revert-item-processing")
            [i].click();
        });

        if (
          document.getElementsByClassName(
            "filepond--action-revert-item-processing"
          ).length == 0
        ) {
          clearInterval(countdown);
        }
      }, 1000);
    }
  }
};
</script>
