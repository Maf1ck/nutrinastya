<script setup lang="ts">
import ServiceCard from './ServiceCard.vue'

const services = [
  { title: 'Консультація', text: '60 хв онлайн: розбір харчування, анкета, рекомендації письмово.', price: 400 },
  { title: 'Індивідуальний супровід на місяць', text: 'Персональний план, щоденник їжі в кабінеті, щотижневі зустрічі й підтримка в чаті.', price: 3000, featured: true },
  { title: 'Раціон на тиждень', text: 'Готове меню з рецептами та списком покупок під ваші смаки.', price: 600 },
]
</script>

<template lang="pug">
section#services.section.section--soft
  .container
    .eyebrow(v-reveal='0') Послуги
    h2.section-title(v-reveal='100') Оберіть формат роботи
    .cards.cards--services
      ServiceCard(v-for='(s, i) in services' :key='s.title' v-bind='s' v-reveal='i * 120')
</template>

<style lang="scss">
@use '@/scss/variables' as *;

// стилі картки — у ServiceCard.vue; сітка .cards — у scss/base.scss
</style>
