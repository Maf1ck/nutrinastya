<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

defineProps<{ title: string; linkText?: string; linkTo?: RouteLocationRaw }>()
</script>

<template lang="pug">
.heading
  h2.heading__title {{ title }}
  router-link.heading__link(v-if="linkTo && linkText" :to="linkTo") {{ linkText }}
</template>

<style lang="scss" scoped>
.heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: $s-16;

  &__title {
    @include display-section;
  }

  &__link {
    flex-shrink: 0;
    padding-bottom: $s-8;
    font-size: 14px;
    font-weight: 700;
    @include up($bp-md) {
      font-size: 16px;
    }
    @include hover-only {
      text-decoration: underline;
      text-underline-offset: 4px;
    }
  }
}
</style>
