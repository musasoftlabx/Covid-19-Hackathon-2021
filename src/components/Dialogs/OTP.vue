<template>
  <div>
    <v-dialog
      v-model="visible"
      persistent
      max-width="300"
      transition="slide-y-transition"
    >
      <v-card dark color="primary" flat class="CustomFormModifier pa-5">
        <v-row no-gutters class="pb-2">
          <v-col cols="9">
            <span class="subtitle-2"
              >Enter the One Time PIN (OTP) you received</span
            >
          </v-col>
          <v-spacer />
          <v-btn icon @click="visible = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-row>
        <v-form ref="Form" v-model="valid" @submit.prevent>
          <v-text-field
            v-model="OTP"
            v-mask="'####'"
            :rules="[validators.required, validators.OTP]"
            filled
            hide-details
            label="OTP"
            prepend-inner-icon="mdi-powershell"
            @keyup.enter="Validate"
          />
          <v-row class="mt-5">
            <v-col>
              <v-btn
                :disabled="loading.resend"
                :loading="loading.resend"
                outlined
                @click="Generate"
                >RESEND</v-btn
              >
            </v-col>
            <v-col align="end">
              <v-btn
                :disabled="!valid || loading.validate"
                :loading="loading.validate"
                color="orange"
                @click="Validate"
                >VALIDATE</v-btn
              >
            </v-col>
          </v-row>
        </v-form>
      </v-card>
    </v-dialog>
    <Attachments
      ref="Attachments"
      :products="products"
      :ApplicationID="ApplicationID"
    />
    <Alert ref="Alert" />
  </div>
</template>

<script>
import * as FilePond from "filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginFileMetadata from "filepond-plugin-file-metadata";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import FilePondPluginImageTransform from "filepond-plugin-image-transform";
import FilePondPluginFileRename from "filepond-plugin-file-rename";
import Attachments from "@/components/Dialogs/Attachments";
export default {
  components: {
    Attachments
  },
  props: ["products"],
  data() {
    return {
      visible: false,
      valid: false,
      loading: {
        validate: false,
        resend: false
      },
      phone: null,
      OTP: null,
      ApplicationID: null,
      FileID: null
    };
  },
  methods: {
    Validate() {
      this.loading.validate = true;
      this.promiseFetch(this.$store.getters.fetchTimeout)(
        fetch(this.$store.getters.endpoint + "OTP/Validate/", {
          method: "post",
          body: JSON.stringify({
            OTP: this.OTP,
            phone: this.phone
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
              this.visible = false;
              FilePond.registerPlugin(
                FilePondPluginFileValidateSize,
                FilePondPluginFileValidateType,
                FilePondPluginFileMetadata,
                FilePondPluginImagePreview,
                FilePondPluginImageTransform,
                FilePondPluginFileRename
              );
              FilePond.setOptions({
                server: {
                  url: this.$store.getters.endpoint + "FileUploader/",
                  process: {
                    method: "post",
                    timeout: 30000,
                    ondata: formData => {
                      formData.append("uuid", this.FileID);
                      return formData;
                    },
                    onload: response => {
                      response = JSON.parse(response);
                      this.$refs.Attachments.uploads.push(response.uuid);
                    },
                    onerror: response => {
                      this.$refs.Alert.Alertify({
                        visible: true,
                        content: response,
                        title: "Upload error",
                        icon: "mdi-progress-alert",
                        color: "error"
                      });

                      setTimeout(() => {
                        document
                          .getElementsByClassName(
                            "filepond--file-action-button filepond--action-remove-item"
                          )[0]
                          .click();
                      }, 2000);

                      this.$refs.Attachments.visible = false;
                    }
                  }
                },
                maxFileSize: "10MB",
                labelMaxFileSizeExceeded: "File is too large",
                labelMaxFileSize: "Maximum file size is {filesize}",
                acceptedFileTypes: [
                  "application/pdf",
                  "image/png",
                  "image/jpeg",
                  "image/jpg"
                ],
                labelFileTypeNotAllowed: "File of invalid type",
                fileValidateTypeLabelExpectedTypes:
                  "Expects .PDF .PNG .JPG .JPEG",
                allowImagePreview: true,
                imagePreviewMinHeight: 44,
                imagePreviewMaxHeight: 256,
                imagePreviewHeight: null,
                imagePreviewMaxFileSize: "10MB",
                imagePreviewTransparencyIndicator: "#39b54a",
                imagePreviewMaxInstantPreviewFileSize: 1000000,
                imageTransformOutputMimeType: "image/jpeg",
                imageTransformOutputQuality: 70,
                dropOnPage: true,
                onaddfile: (error, file) => {
                  this.FileID = file.id;
                },
                onremovefile: (error, file) => {
                  this.$refs.Attachments.uploads = this.$refs.Attachments.uploads.filter(
                    i => i !== file.id
                  );
                },
                labelIdle:
                  '<div style="cursor:pointer">' +
                  '<img style="font-size:40px;color:#39b54a;width:30px;height:30px" src="' +
                  this.$store.getters.server +
                  'img/attachment.png"/>' +
                  '<div style="font-size:15px;font-weight:400;color:#39b54a;opacity:.7">Upload file here</div>' +
                  '<div style="margin: 0 10px;font-size:9px;opacity:.7">Only JPG, PNG, PDF allowed</div>' +
                  "<div class='body-2'>File size less than 10 MB</div>" +
                  "</div>"
              });
              new Promise(resolve => {
                resolve((this.$refs.Attachments.visible = true));
              }).then(() => {
                this.products.KYC.KYCs.forEach(object => {
                  FilePond.create(
                    document.querySelector("[name*=attachment]"),
                    {
                      fileMetadataObject: {
                        key: this.ApplicationID,
                        product: this.products.product.selected,
                        category: this.products.categories.selected,
                        KYC: object.prefix,
                        endpoint: this.$store.getters.server + "api/"
                      }
                    }
                  );
                });
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
          this.loading.validate = false;
        });
    },
    Generate() {
      this.loading.resend = true;
      this.promiseFetch(this.$store.getters.fetchTimeout)(
        fetch(this.$store.getters.endpoint + "OTP/Generate/", {
          method: "post",
          body: JSON.stringify({
            phone: this.phone
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
              this.OTP = null;
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
          this.loading.resend = false;
        });
    }
  }
};
</script>
