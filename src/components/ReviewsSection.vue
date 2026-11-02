<script setup lang="ts">
import ReviewCard from './ReviewCard.vue'

const reviews = [1, 2, 3]
</script>

<template lang="pug">
section#reviews.container
  .eyebrow Відгуки
  h2.section-title Що кажуть клієнти
  .cards.cards--reviews
    ReviewCard(v-for='r in reviews' :key='r')
</template>

<style lang="scss">
@use '@/scss/variables' as *;

// стилі картки — у ReviewCard.vue; сітка .cards — у scss/base.scss
</style>
