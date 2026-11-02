<script setup lang="ts">
import { ref } from 'vue'
import { FAQ } from '@/content/home'

const faq = FAQ

const open = ref<number | null>(null)

function toggle(i: number) {
  open.value = open.value === i ? null : i
}
</script>

<template lang="pug">
section#faq.container
  h2.section-title(v-reveal='0') Часті питання
  .faq
    .faq__item(
      v-for='(item, i) in faq'
      :key='item.q'
      v-reveal='i * 100'
      :class="{ 'faq__item--open': open === i }"
    )
      button.faq__q(
        type='button'
        :id="'faq-q-' + i"
        :aria-expanded='open === i'
        :aria-controls="'faq-a-' + i"
        @click='toggle(i)'
      )
        span {{ item.q }}
        span.faq__icon(aria-hidden='true')
      .faq__a(:id="'faq-a-' + i" role='region' :aria-labelledby="'faq-q-' + i")
        .faq__a-inner
          p {{ item.a }}
</template>

<style lang="scss">
@use '@/scss/variables' as *;

.faq {
  &__item {
    border-top: 1px solid $line;

    &:last-child {
      border-bottom: 1px solid $line;
    }
  }

  &__q {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    width: 100%;
    padding: 22px 0;
    background: none;
    border: none;
    color: $text;
    font: inherit;
    font-size: 18px;
    font-weight: 700;
    text-align: left;

    cursor: pointer;
    transition: color 0.25s ease;

    &:hover {
      color: $accent;
    }

    @media (max-width: $bp-md) {
      font-size: 16px;
    }
  }

  // плюс, що перетворюється на мінус
  &__icon {
    position: relative;
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    background: $bg-soft;
    border-radius: 50%;
    transition: background 0.3s ease, transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);

    &::before,
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 14px;
      height: 2px;
      margin: -1px 0 0 -7px;
      background: $accent;
      border-radius: 1px;
      transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), background 0.3s ease;
    }

    &::after {
      transform: rotate(90deg);
    }
  }

  &__item--open &__icon {
    background: $accent;
    transform: rotate(180deg);

    &::before,
    &::after {
      background: #fff;
    }

    &::after {
      transform: rotate(0deg);
    }
  }

  // плавне розкриття висоти через grid 0fr -> 1fr
  &__a {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  }

  &__a-inner {
    overflow: hidden;

    p {
      padding: 0 56px 22px 0;
      color: $text-muted;
      opacity: 0;
      transform: translateY(-8px);
      transition: opacity 0.3s ease, transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);

      @media (max-width: $bp-md) {
        padding-right: 0;
      }
    }
  }

  &__item--open &__a {
    grid-template-rows: 1fr;
  }

  &__item--open &__a-inner p {
    opacity: 1;
    transform: none;
    transition-delay: 0.1s;
  }
}
</style>
