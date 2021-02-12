<template>
  <section>
    <v-dialog v-model="alert.visible" persistent max-width="300">
      <v-card dark tile flat height="100" :color="alert.color">
        <v-layout column align-center justify-center fill-height>
          <v-icon x-large>{{ alert.icon }}</v-icon>
          <span class="title">{{ alert.title }}</span>
        </v-layout>
      </v-card>
      <v-card tile flat class="pt-5 pl-3 pr-1">
        <v-card-text v-html="alert.content" class="black--text" />
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="alert.visible = false">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </section>
</template>

<script>
export default {
  data() {
    return {
      alert: {
        visible: false,
        icon: "mdi-check-decagram",
        title: null,
        color: undefined,
        content: "All fields need to be filled!"
      }
    };
  },
  methods: {
    Alertify(props) {
      this.alert = {
        ...this.alert,
        ...props
      };
    }
  }
};
</script>
