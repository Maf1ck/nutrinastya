<script setup lang="ts">
import { CONTACTS } from '@/config/site'
</script>

<template lang="pug">
//- шапка внутрішніх сторінок (блог); класи збігаються зі статичною розміткою з build/seo.ts
header.page-header
  .page-header__inner
    RouterLink.page-header__logo(to='/')
      svg(width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true')
        path(d='M5 19c0-8 5-13 14-14-1 9-6 14-14 14z')
        path(d='M5 19l7-7')
      | Анастасія
      span.page-header__role  · нутриціолог
    nav.page-header__nav(aria-label='Навігація')
      RouterLink(to='/') Головна
      RouterLink(to='/blog') Блог
    a.btn.btn--primary.page-header__cta(:href='CONTACTS.telegram' target='_blank' rel='noopener') Записатися
</template>
