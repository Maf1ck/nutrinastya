<script setup lang="ts">
import StepCard from './StepCard.vue'

const steps = [
  { title: 'Анкета', text: 'Цілі, звички, самопочуття, аналізи за бажанням.' },
  { title: 'Консультація', text: 'Обговорюємо ваш день і що реально змінити.' },
  { title: 'План у кабінеті', text: 'Меню, рецепти, список покупок — все в одному місці.' },
  { title: 'Супровід', text: 'Щоденник їжі, чат і корекція плану щотижня.' },
]
</script>

<template lang="pug">
section.section.section--soft
  .container
    .eyebrow Як ми працюємо
    h2.section-title Від анкети до звичок
    .cards.cards--steps
      StepCard(v-for='(step, i) in steps' :key='step.title' :number='i + 1' v-bind='step')
</template>

<style lang="scss">
@use '@/scss/variables' as *;

// стилі картки — у StepCard.vue; сітка .cards — у scss/base.scss
</style>
