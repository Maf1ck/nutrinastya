<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { shopApi } from '@/api/shop'
import heroImage from '@/assets/images/hero.png'
import AppButton from '@/components/ui/AppButton.vue'
import CategoryTile from '@/components/ui/CategoryTile.vue'
import ProductCard from '@/components/ui/ProductCard.vue'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import { useSiteStore } from '@/stores/site'
import type { Product } from '@/types'

const site = useSiteStore()
const popular = ref<Product[]>([])

const infoCards = computed(() => {
  const s = site.settings
  if (!s) return []
  return [
    { title: s.infoCard1Title, text: s.infoCard1Text },
    { title: s.infoCard2Title, text: s.infoCard2Text },
    { title: s.infoCard3Title, text: s.infoCard3Text },
  ].map((card) => ({ title: site.fill(card.title), text: site.fill(card.text) }))
})

onMounted(async () => {
  try {
    popular.value = await shopApi.products({ popular: true, limit: 4 })
  } catch {
    popular.value = []
  }
})
</script>

<template lang="pug">
section.hero
  .hero__inner.container
    .hero__text
      p.hero__eyebrow {{ site.settings?.heroEyebrow }} · {{ site.settings?.city }}
      h1.hero__title {{ site.settings?.heroTitle }}
      p.hero__lead {{ site.settings?.heroText }}
      .hero__buttons
        app-button(variant="accent" :to="{ name: 'catalog' }") Переглянути каталог
        app-button(variant="outline-light" :to="{ name: 'home', hash: '#how' }") Як замовити
    .hero__photo
      img(:src="heroImage" alt="Вітрина кондитерської: торти, еклери та десерти" width="1120" height="920")

section.section(v-if="site.categories.length" aria-labelledby="catalog-title")
  .container
    section-heading#catalog-title(v-reveal title="Каталог" link-text="Увесь каталог →" :link-to="{ name: 'catalog' }")
    .tiles
      category-tile(
        v-for="(category, index) in site.categories"
        :key="category.id"
        v-reveal="index % 4"
        :category="category"
      )

section.section.section--popular(v-if="popular.length" aria-labelledby="popular-title")
  .container
    section-heading#popular-title(v-reveal title="Популярне" link-text="Усі товари →" :link-to="{ name: 'catalog' }")
    .products
      product-card(v-for="(product, index) in popular" :key="product.id" v-reveal="index" :product="product")

section#how.how(aria-label="Як це працює")
  .how__inner.container
    article.how__card(v-for="(card, index) in infoCards" :key="card.title" v-reveal="index")
      h2.how__title {{ card.title }}
      p.how__text {{ card.text }}
</template>

<style lang="scss" scoped>
.hero {
  background: $c-ink;
  color: $c-bg;

  &__inner {
    display: flex;
    flex-direction: column;
    gap: $s-40;
    padding-block: $s-48 $s-64;
    @include up($bp-lg) {
      flex-direction: row;
      align-items: center;
      gap: $s-64;
      padding-block: $s-96;
    }
  }

  &__text {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: flex-start;
    gap: $s-20;
    min-width: 0;
    @include up($bp-md) {
      gap: $s-28;
    }
  }

  // Staggered entrance of the hero content
  &__text > * {
    animation: rise 0.8s cubic-bezier(0.2, 0.7, 0.2, 1) both;
    @for $i from 1 through 4 {
      &:nth-child(#{$i}) {
        animation-delay: #{$i * 90}ms;
      }
    }
  }

  &__eyebrow {
    @include eyebrow;
    color: $c-accent;
  }

  &__title {
    @include display-hero;
  }

  &__lead {
    max-width: 560px;
    color: $c-on-dark;
    font-size: 16px;
    line-height: 26px;
    @include up($bp-md) {
      font-size: 19px;
      line-height: 30px;
    }
  }

  &__buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
  }

  &__photo {
    flex-shrink: 0;
    overflow: hidden;
    border-radius: $r-panel;
    aspect-ratio: 560 / 460;
    @include up($bp-lg) {
      width: 560px;
    }

    animation: hero-photo 1.2s cubic-bezier(0.2, 0.7, 0.2, 1) 0.15s both;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      animation: hero-zoom 14s ease-out both;
    }
  }
}

@keyframes hero-photo {
  from {
    opacity: 0;
    transform: translateY(32px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes hero-zoom {
  from {
    transform: scale(1.08);
  }
  to {
    transform: scale(1);
  }
}

.section {
  padding-block: $s-48;
  @include up($bp-md) {
    padding-block: $s-96;
  }

  &--popular {
    padding-top: 0;
  }

  .container {
    display: flex;
    flex-direction: column;
    gap: $s-24;
    @include up($bp-md) {
      gap: $s-40;
    }
  }
}

.tiles {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $s-12;
  @include up($bp-md) {
    gap: $s-24;
  }
  @include up($bp-lg) {
    grid-template-columns: repeat(4, 1fr);
  }
}

.products {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $s-12;
  @include up($bp-md) {
    gap: $s-24;
  }
  @include up($bp-lg) {
    grid-template-columns: repeat(4, 1fr);
  }
}

.how {
  background: $c-bg-alt;

  &__inner {
    display: grid;
    gap: $s-16;
    padding-block: $s-48;
    @include up($bp-md) {
      padding-block: $s-80;
    }
    @include up($bp-lg) {
      grid-template-columns: repeat(3, 1fr);
      gap: $s-24;
    }
  }

  &__card {
    display: flex;
    flex-direction: column;
    gap: $s-12;
    padding: $s-24;
    border-radius: $r-panel;
    background: $c-card;
    @include up($bp-md) {
      padding: 36px;
    }
  }

  &__title {
    @include title-lg(34px);
  }

  &__text {
    color: $c-muted;
    font-size: 16px;
    line-height: 26px;
  }
}
</style>
