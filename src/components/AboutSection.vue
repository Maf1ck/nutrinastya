<script setup lang="ts">
const stats = [
  { value: '[X] років', label: 'практики' },
  { value: '[X]+', label: 'клієнтів' },
  { value: '[X]', label: 'дипломів' },
]
</script>

<template lang="pug">
section#about.container.about
  .about__head
    .eyebrow Про мене
    h2.section-title [Ім'я Прізвище]
  .about__body
    p [Освіта, курси, досвід. 2–3 речення про підхід: без заборонених продуктів, з повагою до вашого способу життя, опора на звички й самопочуття.]
    .about__stats
      .stat(v-for='s in stats' :key='s.value')
        .stat__value {{ s.value }}
        div {{ s.label }}
</template>

<style lang="scss">
@use '@/scss/variables' as *;

.about {
  display: flex;
  flex-wrap: wrap;
  gap: 48px;

  &__head {
    flex: 1 1 320px;
    min-width: 0;

    .section-title {
      margin: 0;
    }
  }

  &__body {
    display: flex;
    flex: 2 1 480px;
    flex-direction: column;
    gap: 24px;
    min-width: 0;
    color: $text-muted;
    font-size: 18px;
  }

  &__stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;

    @media (max-width: 480px) {
      grid-template-columns: 1fr;
    }
  }
}

.stat {
  padding: 18px;
  background: $bg-soft;
  border-radius: 18px;
  font-size: 14px;

  &__value {
    color: $green-link;
    font-family: $font-heading;
    font-size: 30px;
  }
}
</style>
