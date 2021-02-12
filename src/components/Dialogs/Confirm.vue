<template>
  <section>
    <v-dialog
      v-model="confirm.visible"
      persistent
      max-width="300"
      @keydown.esc="onCancel"
    >
      <v-card dark tile flat height="100" :color="confirm.color">
        <v-layout column align-center justify-center fill-height>
          <v-icon x-large>{{ confirm.icon }}</v-icon>
          <span class="title">{{ confirm.title }}</span>
        </v-layout>
      </v-card>
      <v-card tile flat class="pt-5 pl-3 pr-1">
        <v-card-text v-html="confirm.content" class="black--text" />
        <v-card-actions>
          <v-spacer />
          <v-btn v-if="confirm.falsy != 'HIDDEN'" text @click="onCancel">{{
            confirm.falsy
          }}</v-btn>
          <v-btn text @click="onConfirm">{{ confirm.truth }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </section>
</template>

<script>
export default {
  data() {
    return {
      confirm: {
        visible: false,
        operation: null,
        metadata: null,
        content: null,
        title: null,
        icon: null,
        color: null,
        truth: null,
        falsy: null
      }
    };
  },
  methods: {
    Confirmify(props) {
      this.confirm = {
        ...this.confirm,
        ...props
      };
    },
    onConfirm() {
      this.$emit("confirm");
    },
    onCancel() {
      this.$emit("cancel");
    }
  }
};
</script>
