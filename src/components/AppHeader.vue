<script setup lang="ts">
const nav = [
  { href: '#about', label: 'Про мене' },
  { href: '#services', label: 'Послуги' },
  { href: '#quiz', label: 'Тест' },
  { href: '#reviews', label: 'Відгуки' },
  { href: '#faq', label: 'FAQ' },
]
</script>

<template lang="pug">
header.header
  .header__inner
    .header__logo
      svg(width='30' height='30' viewBox='0 0 24 24' fill='none' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true')
        path(d='M5 19c0-8 5-13 14-14-1 9-6 14-14 14z')
        path(d='M5 19l7-7')
      span [Ім'я] · нутриціолог
    nav.header__nav
      a(v-for='item in nav' :key='item.href' :href='item.href') {{ item.label }}
    a.btn.btn--primary(href='#contact') Записатися
</template>

<style lang="scss">
@use '@/scss/variables' as *;

.header {
  border-bottom: 1px solid $line;

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
      color: $text-nav;
      text-decoration: none;

      &:hover {
        color: $accent;
      }
    }
  }
}
</style>
