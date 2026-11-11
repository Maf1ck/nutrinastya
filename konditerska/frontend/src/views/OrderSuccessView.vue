<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppButton from '@/components/ui/AppButton.vue'
import { useSiteStore } from '@/stores/site'

const route = useRoute()
const site = useSiteStore()

const orderNumber = computed(() => {
  const value = Number(route.query.n)
  return Number.isInteger(value) && value > 0 ? value : null
})
</script>

<template lang="pug">
.done.container
  p.done__eyebrow Замовлення прийнято
  h1.done__title Дякуємо!
  p.done__text(v-if="orderNumber") Ваше замовлення №{{ orderNumber }} надіслано до кондитерської.
  p.done__text {{ site.settings?.orderNote }} Оплата — під час отримання замовлення.
  app-button(:to="{ name: 'catalog' }") Повернутися до каталогу
</template>

<style lang="scss" scoped>
.done {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: $s-20;
  padding-block: $s-64 $s-96;
  @include up($bp-md) {
    padding-block: $s-96;
  }

  &__eyebrow {
    @include eyebrow;
    color: $c-muted;
  }

  &__title {
    @include display-page(96px);
  }

  &__text {
    max-width: 560px;
    color: $c-muted;
    font-size: 18px;
    line-height: 28px;
  }
}
</style>
