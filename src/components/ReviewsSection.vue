<script setup lang="ts">
import ReviewCard from './ReviewCard.vue'

const reviews = [1, 2, 3]
</script>

<template lang="pug">
section#reviews.container
  .eyebrow(v-reveal='0') Відгуки
  h2.section-title(v-reveal='100') Що кажуть клієнти
  .cards.cards--reviews
    ReviewCard(v-for='(r, i) in reviews' :key='r' v-reveal='i * 120')
</template>

<style lang="scss">
@use '@/scss/variables' as *;

// стилі картки — у ReviewCard.vue; сітка .cards — у scss/base.scss
</style>
