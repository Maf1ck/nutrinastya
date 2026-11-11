<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { shopApi } from '@/api/shop'
import ProductCard from '@/components/ui/ProductCard.vue'
import SegmentedToggle from '@/components/ui/SegmentedToggle.vue'
import { useSiteStore } from '@/stores/site'
import type { Product, ProductSort } from '@/types'

type StateFilter = 'all' | 'fresh' | 'frozen'

const props = defineProps<{ slug?: string }>()

const site = useSiteStore()
const products = ref<Product[]>([])
const loading = ref(true)
const error = ref('')
const stateFilter = ref<StateFilter>('all')
const sort = ref<ProductSort>('popular')

const category = computed(() => site.categories.find((item) => item.slug === props.slug))
const unknownCategory = computed(() => props.slug !== undefined && site.categories.length > 0 && !category.value)
const title = computed(() => (props.slug ? (category.value?.name ?? '') : 'Каталог'))

const stateOptions = [
  { value: 'all' as const, label: 'Усі' },
  { value: 'fresh' as const, label: 'Свіжі' },
  { value: 'frozen' as const, label: 'Заморожені' },
]

const sortOptions: { value: ProductSort; label: string }[] = [
  { value: 'popular', label: 'за популярністю' },
  { value: 'price_asc', label: 'від дешевих до дорогих' },
  { value: 'price_desc', label: 'від дорогих до дешевих' },
]

let requestId = 0

async function load(): Promise<void> {
  const current = ++requestId
  loading.value = true
  try {
    const result = await shopApi.products({
      category: props.slug,
      state: stateFilter.value === 'all' ? undefined : stateFilter.value,
      sort: sort.value,
    })
    if (current !== requestId) return
    products.value = result
    error.value = ''
  } catch (cause) {
    if (current !== requestId) return
    error.value = cause instanceof Error ? cause.message : 'Не вдалося завантажити товари'
  } finally {
    if (current === requestId) loading.value = false
  }
}

watch(() => props.slug, () => {
  stateFilter.value = 'all'
}, { flush: 'sync' })
watch([() => props.slug, stateFilter, sort], load, { immediate: true })

watch(title, (value) => {
  if (value) document.title = `${value} — ${site.settings?.brandName ?? ''}`
}, { immediate: true })
</script>

<template lang="pug">
.page.container
  template(v-if="unknownCategory")
    h1.page__title Категорію не знайдено
    p.page__empty
      router-link.page__back(:to="{ name: 'catalog' }") Перейти до каталогу
  template(v-else)
    nav.crumbs(aria-label="Хлібні крихти")
      router-link(:to="{ name: 'home' }") Головна
      span(aria-hidden="true") /
      span(aria-current="page") {{ title }}

    mixin sort
      label.sort
        span.sort__label Сортування:
        select.sort__select(v-model="sort")
          option(v-for="option in sortOptions" :key="option.value" :value="option.value") {{ option.label }}

    .page__head
      .page__heading
        h1.page__title {{ title }}
        p.page__desc(v-if="category?.description") {{ category.description }}
      .page__sort-desktop
        +sort

    //- Phones and tablets: filters stay visible at the top while scrolling
    .filterbar
      segmented-toggle(v-model="stateFilter" :options="stateOptions" label="Фільтр за станом" size="sm")
      +sort

    .page__body
      aside.sidebar
        h2.sidebar__heading Категорії
        ul.sidebar__list
          li(v-for="item in site.categories" :key="item.id")
            router-link.sidebar__link(
              :to="{ name: 'category', params: { slug: item.slug } }"
            ) {{ item.name }}
        h2.sidebar__heading Стан
        segmented-toggle(v-model="stateFilter" :options="stateOptions" label="Фільтр за станом" size="sm")

      .results
        p.results__message(v-if="error" role="alert") {{ error }}
        p.results__message(v-else-if="!loading && !products.length") У цій категорії поки немає товарів.
        .results__grid(v-else :aria-busy="loading")
          product-card(v-for="(product, index) in products" :key="product.id" v-reveal="index % 3" :product="product" with-state)
</template>

<style lang="scss" scoped>
.page {
  padding-block: $s-24 $s-64;
  @include up($bp-md) {
    padding-block: $s-28 $s-96;
  }

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $s-16;
    padding-block: $s-16 $s-16;
    @include up($bp-lg) {
      padding-bottom: $s-40;
    }
  }

  &__sort-desktop {
    display: none;
    @include up($bp-lg) {
      display: block;
    }
  }

  &__heading {
    display: flex;
    flex-direction: column;
    gap: $s-8;
    min-width: 0;
  }

  &__title {
    @include display-page;
  }

  &__desc {
    max-width: 520px;
    color: $c-muted;
    font-size: 16px;
    line-height: 1.5;
  }

  &__body {
    display: grid;
    gap: $s-24;
    @include up($bp-lg) {
      grid-template-columns: 260px 1fr;
      gap: $s-48;
    }
  }

  &__empty {
    padding-top: $s-24;
  }

  &__back {
    text-decoration: underline;
    text-underline-offset: 4px;
  }
}

.crumbs {
  display: flex;
  flex-wrap: wrap;
  gap: $s-8;
  color: $c-muted;
  font-size: 14px;

  a:hover {
    text-decoration: underline;
  }
}

.filterbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: $s-8;
  margin: 0 calc(var(--gutter) * -1) $s-16;
  padding: $s-12 var(--gutter);
  overflow-x: auto;
  border-block: 1px solid $c-line;
  background: $c-bg;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  > * {
    flex-shrink: 0;
  }

  // Compact on phones: the word "Сортування:" is dropped so both controls fit in one row.
  .sort {
    padding: $s-8 $s-12;
  }

  .sort__label {
    @include down($bp-md) {
      display: none;
    }
  }

  @include up($bp-lg) {
    display: none;
  }
}

.sort {
  display: inline-flex;
  align-items: center;
  gap: $s-8;
  padding: $s-12 $s-20;
  border: 1px solid $c-line;
  border-radius: $r-pill;
  font-size: 14px;
  font-weight: 600;

  &__select {
    max-width: 100%;
    border: 0;
    background: transparent;
    font-weight: 600;
    cursor: pointer;
  }
}

.sidebar {
  display: none;
  @include up($bp-lg) {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: $s-28;
  }

  &__heading {
    @include eyebrow(13px, 0.12em);
    color: $c-muted;
    font-weight: 700;
  }

  // Categories are already shown as pills in the header on smaller screens.
  &__heading:first-child {
    display: none;
    @include up($bp-lg) {
      display: block;
    }
  }

  &__list {
    display: none;
    width: 100%;
    @include up($bp-lg) {
      display: flex;
      flex-direction: column;
      gap: $s-4;
    }
  }

  &__link {
    display: block;
    padding: $s-12 $s-16;
    border-radius: $r-input;
    font-size: 15px;
    font-weight: 500;
    transition: background-color 0.2s;

    @include hover-only {
      background: $c-bg-alt;
    }

    &.router-link-active {
      background: $c-ink;
      color: $c-bg;
      font-weight: 700;
    }
  }
}

.results {
  min-width: 0;

  &__message {
    padding: $s-32 0;
    color: $c-muted;
  }

  &__grid {
    display: grid;
    gap: $s-12;
    @include up($bp-md) {
      grid-template-columns: repeat(2, 1fr);
      gap: $s-24;
    }
    @include up($bp-xl) {
      grid-template-columns: repeat(3, 1fr);
    }

    &[aria-busy='true'] {
      opacity: 0.6;
    }
  }
}
</style>
