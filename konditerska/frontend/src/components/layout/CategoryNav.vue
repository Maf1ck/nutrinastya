<script setup lang="ts">
import { useSiteStore } from '@/stores/site'

const site = useSiteStore()
</script>

<template lang="pug">
nav.cat-nav(aria-label="Категорії")
  ul.cat-nav__list
    li(v-for="category in site.categories" :key="category.id")
      router-link.cat-nav__link(:to="{ name: 'category', params: { slug: category.slug } }") {{ category.name }}
</template>

<style lang="scss" scoped>
.cat-nav {
  border-bottom: 1px solid $c-line;

  &__list {
    display: flex;
    gap: $s-8;
    max-width: $page-max;
    margin-inline: auto;
    padding: $s-8 var(--gutter) $s-16;
    overflow-x: auto;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }

    @include up($bp-xl) {
      justify-content: center;
      gap: $s-40;
      padding-block: $s-16;
      overflow: visible;
    }
  }

  &__link {
    display: block;
    padding: $s-8 $s-16;
    border: 1px solid $c-line;
    border-radius: $r-pill;
    color: $c-ink;
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
    transition:
      border-color 0.2s,
      color 0.2s;

    @include up($bp-xl) {
      padding: 0;
      border: 0;
      border-radius: 0;
      color: $c-muted;
      font-size: 15px;
    }

    @include hover-only {
      border-color: $c-ink;
      color: $c-ink;
    }

    &.router-link-active {
      border-color: $c-ink;
      background: $c-ink;
      color: $c-bg;
      @include up($bp-xl) {
        background: none;
        color: $c-ink;
        font-weight: 700;
      }
    }
  }
}
</style>
