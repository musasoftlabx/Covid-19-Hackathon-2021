<template>
  <v-app>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<style>
.v-content__wrap,
html {
  background-color: #e0e0e0 !important;
}
.v-label.theme--light.error--text {
  left: 0 !important;
}
.v-label.v-label--active.theme--light {
  left: -27px !important;
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
.CustomFormModifier .v-text-field {
  margin: 0;
  padding: 0;
}
.CustomFormModifier .v-text-field input {
  padding: 4px 0;
}
.CustomFormModifier .v-text-field__details {
  margin-bottom: 0 !important;
}
.CustomFormModifier .v-select__selection--comma {
  margin: 0;
}
.CustomFormModifier .v-label {
  font-size: 14px !important;
}
.CustomFormModifier .v-messages {
  font-size: 11px;
  text-align: right !important;
  margin-top: -2px !important;
}
.CustomFormModifier .col,
.CustomFormModifier .col-1,
.CustomFormModifier .col-2,
.CustomFormModifier .col-3,
.CustomFormModifier .col-4,
.CustomFormModifier .col-5,
.CustomFormModifier .col-6,
.CustomFormModifier .col-7,
.CustomFormModifier .col-8,
.CustomFormModifier .col-9,
.CustomFormModifier .col-10,
.CustomFormModifier .col-11,
.CustomFormModifier .col-12,
.CustomFormModifier .col-auto,
.CustomFormModifier .col-lg,
.CustomFormModifier .col-lg-1,
.CustomFormModifier .col-lg-2,
.CustomFormModifier .col-lg-3,
.CustomFormModifier .col-lg-4,
.CustomFormModifier .col-lg-5,
.CustomFormModifier .col-lg-6,
.CustomFormModifier .col-lg-7,
.CustomFormModifier .col-lg-8,
.CustomFormModifier .col-lg-9,
.CustomFormModifier .col-lg-10,
.CustomFormModifier .col-lg-11,
.CustomFormModifier .col-lg-12,
.CustomFormModifier .col-lg-auto,
.CustomFormModifier .col-md,
.CustomFormModifier .col-md-1,
.CustomFormModifier .col-md-2,
.CustomFormModifier .col-md-3,
.CustomFormModifier .col-md-4,
.CustomFormModifier .col-md-5,
.CustomFormModifier .col-md-6,
.CustomFormModifier .col-md-7,
.CustomFormModifier .col-md-8,
.CustomFormModifier .col-md-9,
.CustomFormModifier .col-md-10,
.CustomFormModifier .col-md-11,
.CustomFormModifier .col-md-12,
.CustomFormModifier .col-md-auto,
.CustomFormModifier .col-sm,
.CustomFormModifier .col-sm-1,
.CustomFormModifier .col-sm-2,
.CustomFormModifier .col-sm-3,
.CustomFormModifier .col-sm-4,
.CustomFormModifier .col-sm-5,
.CustomFormModifier .col-sm-6,
.CustomFormModifier .col-sm-7,
.CustomFormModifier .col-sm-8,
.CustomFormModifier .col-sm-9,
.CustomFormModifier .col-sm-10,
.CustomFormModifier .col-sm-11,
.CustomFormModifier .col-sm-12,
.CustomFormModifier .col-sm-auto,
.CustomFormModifier .col-xl,
.CustomFormModifier .col-xl-1,
.CustomFormModifier .col-xl-2,
.CustomFormModifier .col-xl-3,
.CustomFormModifier .col-xl-4,
.CustomFormModifier .col-xl-5,
.CustomFormModifier .col-xl-6,
.CustomFormModifier .col-xl-7,
.CustomFormModifier .col-xl-8,
.CustomFormModifier .col-xl-9,
.CustomFormModifier .col-xl-10,
.CustomFormModifier .col-xl-11,
.CustomFormModifier .col-xl-12,
.CustomFormModifier .col-xl-auto {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}
</style>
