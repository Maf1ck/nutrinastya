<script setup lang="ts">
import { CONTACTS } from '@/config/site'

defineProps<{
  title: string
  text: string
  price: number
  featured?: boolean
}>()
</script>

<template lang="pug">
.service(:class="{ 'service--featured': featured }")
  .service__badge(v-if='featured') Найпопулярніше
  h3.service__title {{ title }}
  p.service__text {{ text }}
  .service__price {{ price }} ₴
  a.btn(:href='CONTACTS.telegram' target='_blank' rel='noopener' :class="featured ? 'btn--white' : 'btn--outline'") Записатися
</template>

<style lang="scss">
@use '@/scss/variables' as *;

.service {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 30px;
  background: $bg;
  border-radius: 24px;

  &__title {
    font-size: 21px;
  }

  &__text {
    color: $text-muted;
  }

  &__price {
    margin-top: auto;
    font-family: $font-heading;
    font-size: 32px;
  }

  .btn {
    padding: 13px;
  }

  &--featured {
    background: $green-dark;
    color: #fff;

    .service__text {
      color: $text-on-dark;
    }
  }

  &__badge {
    align-self: flex-start;
    padding: 4px 12px;
    background: $badge-bg;
    border-radius: $pill;
    color: $text-heading;
    font-size: 13px;
    font-weight: 700;
  }
}
.service {
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 16px 40px rgba($green-dark, 0.12);
  }
}
</style>
