<script setup lang="ts">
import ServiceCard from './ServiceCard.vue'

const services = [
  { title: 'Разова консультація', text: '60 хв онлайн: розбір харчування, анкета, рекомендації письмово.' },
  { title: 'Супровід 4 тижні', text: 'Персональний план, щоденник їжі в кабінеті, щотижневі зустрічі й підтримка в чаті.', featured: true },
  { title: 'Розбір аналізів', text: 'Пояснення результатів простими словами та поради щодо раціону. Не замінює лікаря.' },
  { title: 'Меню на тиждень', text: 'Готове меню з рецептами та списком покупок під ваші смаки.' },
]
</script>

<template lang="pug">
section#services.section.section--soft
  .container
    .eyebrow Послуги
    h2.section-title Оберіть формат роботи
    .cards.cards--services
      ServiceCard(v-for='s in services' :key='s.title' v-bind='s')
</template>

<style lang="scss">
@use '@/scss/variables' as *;

// стилі картки — у ServiceCard.vue; сітка .cards — у scss/base.scss
</style>
