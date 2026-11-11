<script setup lang="ts">
import { useSiteStore } from '@/stores/site'

const site = useSiteStore()
</script>

<template lang="pug">
.info-bar
  p.info-bar__text {{ site.infoBar }}
</template>

<style lang="scss" scoped>
.info-bar {
  padding: $s-8 var(--gutter);
  background: $c-ink-dark;
  color: $c-bg;
  text-align: center;

  &__text {
    font-size: 12px;
    font-weight: 500;
    line-height: 1.4;
    @include up($bp-md) {
      font-size: 13px;
    }
  }
}
</style>
