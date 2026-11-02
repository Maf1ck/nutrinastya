<script setup lang="ts">
import { SERVICES } from '@/content/home'
import ServiceCard from './ServiceCard.vue'

const services = SERVICES
</script>

<template lang="pug">
section#services.section.section--soft
  .container
    .eyebrow(v-reveal='0') Послуги
    h2.section-title(v-reveal='100') Оберіть формат роботи
    .cards.cards--services
      ServiceCard(v-for='(s, i) in services' :key='s.title' v-bind='s' v-reveal='i * 120')
</template>

<style lang="scss">
@use '@/scss/variables' as *;

// стилі картки — у ServiceCard.vue; сітка .cards — у scss/base.scss
</style>
