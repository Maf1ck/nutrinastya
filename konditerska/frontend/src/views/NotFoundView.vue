<script setup lang="ts">
import AppButton from '@/components/ui/AppButton.vue'
</script>

<template lang="pug">
.nf.container
  p.nf__code 404
  h1.nf__title Сторінку не знайдено
  app-button(:to="{ name: 'home' }") На головну
</template>

<style lang="scss" scoped>
.nf {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: $s-20;
  padding-block: $s-64 $s-96;

  &__code {
    @include eyebrow;
    color: $c-muted;
  }

  &__title {
    @include display-page(80px);
  }
}
</style>
