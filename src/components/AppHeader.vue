<script setup lang="ts">
import { useScrolled } from '@/composables/useScrolled'

const scrolled = useScrolled(10)
const nav = [
  { href: '#about', label: 'Про мене' },
  { href: '#services', label: 'Послуги' },
  { href: '#quiz', label: 'Тест' },
  { href: '#reviews', label: 'Відгуки' },
  { href: '#faq', label: 'FAQ' },
]
</script>

<template lang="pug">
header.header(:class="{ 'header--scrolled': scrolled }")
  .header__inner
    .header__logo
      svg(width='30' height='30' viewBox='0 0 24 24' fill='none' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true')
        path(d='M5 19c0-8 5-13 14-14-1 9-6 14-14 14z')
        path(d='M5 19l7-7')
      span Настя · нутриціолог
    nav.header__nav
      a(v-for='item in nav' :key='item.href' :href='item.href') {{ item.label }}
    a.btn.btn--primary(href='#contact') Записатися
</template>

<style lang="scss">
@use '@/scss/variables' as *;

.header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid $line;
  transition: box-shadow 0.3s ease, background 0.3s ease;

  &--scrolled {
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 6px 24px rgba($green-dark, 0.08);
  }

  &__inner {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    max-width: $container;
    margin: 0 auto;
    padding: 18px 24px;
  }

  &__logo {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: $font-heading;
    font-size: 22px;
    font-weight: 600;

    svg {
      stroke: $accent;
    }
  }

  &__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    font-size: 15px;

    a {
      position: relative;
      color: $text-nav;
      text-decoration: none;
      transition: color 0.25s ease;

      &::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: -4px;
        width: 100%;
        height: 2px;
        background: $accent;
        border-radius: 1px;
        transform: scaleX(0);
        transform-origin: right;
        transition: transform 0.3s ease;
      }

      &:hover::after {
        transform: scaleX(1);
        transform-origin: left;
      }

      &:hover {
        color: $accent;
      }
    }
  }
}
</style>
