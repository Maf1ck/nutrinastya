<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import SegmentedToggle from '@/components/ui/SegmentedToggle.vue'
import { formatPrice, STATE_LABELS } from '@/composables/useFormat'
import { defaultState, useCartStore } from '@/stores/cart'
import type { Product, ProductState } from '@/types'

const props = defineProps<{
  product: Product
  /** Show the fresh / frozen switch (catalog page). */
  withState?: boolean
}>()

const cart = useCartStore()
const state = ref<ProductState>(defaultState(props.product))
const justAdded = ref(false)
let resetTimer: ReturnType<typeof setTimeout> | undefined

const stateOptions = [
  { value: 'fresh' as const, label: STATE_LABELS.fresh, disabled: !props.product.hasFresh },
  { value: 'frozen' as const, label: STATE_LABELS.frozen, disabled: !props.product.hasFrozen },
]

function addToCart(): void {
  cart.add(props.product, props.withState ? state.value : defaultState(props.product))
  justAdded.value = true
  clearTimeout(resetTimer)
  resetTimer = setTimeout(() => (justAdded.value = false), 1400)
}

onBeforeUnmount(() => clearTimeout(resetTimer))
</script>

<template lang="pug">
article.card(:class="{ 'card--full': withState }")
  .card__photo
    img(v-if="product.imageUrl" :src="product.imageUrl" :alt="product.name" loading="lazy")
    .card__placeholder(v-else aria-hidden="true") [ФОТО]
  .card__body
    h3.card__title {{ product.name }}
    p.card__weight(v-if="product.weightLabel") Вага · {{ product.weightLabel }}
    segmented-toggle.card__state(
      v-if="withState"
      v-model="state"
      :options="stateOptions"
      :label="`Стан: ${product.name}`"
      size="sm"
    )
    .card__footer
      span.card__price {{ formatPrice(product.price) }}
      app-button(@click="addToCart")
        | {{ justAdded ? 'Додано ✓' : 'У кошик' }}
</template>

<style lang="scss" scoped>
.card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: $r-card;
  background: $c-card;
  transition:
    transform 0.3s cubic-bezier(0.2, 0.7, 0.2, 1),
    box-shadow 0.3s;

  @include hover-only {
    transform: translateY(-4px);
    box-shadow: 0 18px 34px -18px rgb(30 43 37 / 35%);

    .card__photo img {
      transform: scale(1.06);
    }
  }

  // Catalog page on phones: compact horizontal card. The photo is inset with its own
  // rounded corners so it never touches the card edge.
  &--full {
    flex-direction: row;
    gap: $s-12;
    padding: $s-12;
    @include up($bp-md) {
      flex-direction: column;
      gap: 0;
      padding: 0;
    }
  }

  &--full &__photo {
    flex: 0 0 116px;
    align-self: stretch;
    min-height: 148px;
    aspect-ratio: auto;
    border-radius: $r-photo;
    @include up($bp-md) {
      flex: none;
      align-self: auto;
      min-height: 0;
      aspect-ratio: 4 / 3;
      border-radius: 0;
    }
  }

  &--full &__body {
    justify-content: center;
    padding: $s-4 $s-4 $s-4 0;
    @include up($bp-md) {
      justify-content: flex-start;
      padding: $s-20;
    }
  }

  &__photo {
    aspect-ratio: 4 / 3;
    background: $c-bg-alt;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s cubic-bezier(0.2, 0.7, 0.2, 1);
    }
  }

  &__placeholder {
    display: grid;
    place-items: center;
    height: 100%;
    color: $c-muted;
    font-weight: 600;
    letter-spacing: 0.1em;
  }

  &__body {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: $s-8;
    padding: $s-16;
    @include up($bp-md) {
      gap: $s-12;
      padding: $s-20;
    }
  }

  &__title {
    @include title-md;
    overflow-wrap: anywhere;
  }

  &__weight {
    color: $c-muted;
    font-size: 14px;
  }

  &__state {
    align-self: flex-start;
  }

  &__footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: $s-8 $s-12;
    margin-top: auto;
    padding-top: $s-4;
  }

  &__price {
    font-size: 18px;
    font-weight: 700;
  }
}
</style>
