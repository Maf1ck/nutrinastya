<script setup lang="ts">
import { computed } from 'vue'
import { pluralize } from '@/composables/useFormat'
import type { Category } from '@/types'

const props = defineProps<{ category: Category }>()

const countLabel = computed(() => {
  const count = props.category.productCount
  return count ? `${count} ${pluralize(count, ['товар', 'товари', 'товарів'])}` : 'Скоро з’явиться'
})
</script>

<template lang="pug">
router-link.tile(
  :to="{ name: 'category', params: { slug: category.slug } }"
  :class="`tile--tone-${category.tileTone}`"
)
  span.tile__top
    span.tile__count {{ countLabel }}
    span.tile__photo(v-if="category.coverUrl")
      img(:src="category.coverUrl" alt="" loading="lazy")
  span.tile__bottom
    span.tile__text
      span.tile__name {{ category.name }}
      span.tile__desc(v-if="category.description") {{ category.description }}
    span.tile__arrow(aria-hidden="true") →
</template>

<style lang="scss" scoped>
.tile {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: $s-16;
  min-height: 190px;
  padding: $s-16;
  border-radius: $r-tile;
  transition:
    transform 0.3s cubic-bezier(0.2, 0.7, 0.2, 1),
    box-shadow 0.3s;
  @include up($bp-sm) {
    padding: $s-20;
  }
  @include up($bp-md) {
    min-height: 260px;
    padding: $s-28;
  }

  @include hover-only {
    transform: translateY(-6px);
    box-shadow: 0 16px 32px -16px rgb(30 43 37 / 35%);
  }

  &:active {
    transform: translateY(-2px) scale(0.99);
  }

  &--tone-1 {
    background: $c-tile-1;
  }
  &--tone-2 {
    background: $c-tile-2;
  }
  &--tone-3 {
    background: $c-tile-3;
  }
  &--tone-4 {
    background: $c-tile-4;
  }

  &__top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: $s-8;
  }

  // Counter pill: says at a glance how many products are inside.
  &__count {
    padding: 4px $s-12;
    border-radius: $r-pill;
    background: rgb(255 255 255 / 55%);
    color: $c-ink;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.4;
    white-space: nowrap;
  }

  &__photo {
    flex-shrink: 0;
    width: 56px;
    height: 56px;
    overflow: hidden;
    border: 3px solid rgb(255 255 255 / 80%);
    border-radius: 50%;
    @include up($bp-md) {
      width: 84px;
      height: 84px;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s cubic-bezier(0.2, 0.7, 0.2, 1);
    }
  }

  @include hover-only {
    .tile__photo img {
      transform: scale(1.12) rotate(2deg);
    }
    .tile__arrow {
      transform: translateX(6px);
    }
  }

  &__bottom {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: $s-8;
  }

  &__text {
    display: flex;
    flex-direction: column;
    gap: $s-4;
    min-width: 0;
  }

  &__name {
    font-family: $font-serif;
    font-weight: 600;
    font-size: 21px;
    line-height: 1.1;
    overflow-wrap: break-word;
    @include up($bp-md) {
      font-size: 32px;
      line-height: 34px;
    }
  }

  &__desc {
    display: none;
    color: $c-muted;
    font-size: 13px;
    line-height: 1.4;
    @include up($bp-md) {
      display: block;
    }
  }

  &__arrow {
    flex-shrink: 0;
    font-size: 20px;
    font-weight: 700;
    line-height: 1;
    transition: transform 0.3s cubic-bezier(0.2, 0.7, 0.2, 1);
    @include up($bp-md) {
      font-size: 24px;
    }
  }
}
</style>
