<script setup lang="ts">
import { useSiteStore } from '@/stores/site'

defineProps<{ light?: boolean }>()

const site = useSiteStore()
</script>

<template lang="pug">
router-link.logo(:to="{ name: 'home' }" :class="{ 'logo--light': light }" aria-label="На головну")
  span.logo__name {{ site.settings?.brandName }}
  span.logo__tagline {{ site.settings?.brandTagline }}
</template>

<style lang="scss" scoped>
.logo {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  color: $c-ink;

  &--light {
    color: $c-bg;
  }

  &__name {
    font-family: $font-serif;
    font-weight: 600;
    font-size: 24px;
    line-height: 1.1;
    letter-spacing: 0.16em;
    @include up($bp-md) {
      font-size: 30px;
    }
  }

  &__tagline {
    font-family: $font-serif;
    font-weight: 500;
    font-style: italic;
    font-size: 12px;
    @include up($bp-md) {
      font-size: 14px;
    }
  }
}
</style>
