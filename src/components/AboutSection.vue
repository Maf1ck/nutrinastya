<script setup lang="ts">
const stats = [
  { value: '3+', label: 'роки практики' },
  { value: '100+', label: 'клієнтів' },
  { value: '5', label: 'дипломів і сертифікатів' },
]

const certificates = [
  'Базова нутриціологія',
  'Спортивна нутриціологія',
  'Нутриціологія professional level',
  'Харчування при аутоімунних захворюваннях',
]
</script>

<template lang="pug">
section#about.container.about
  .about__intro
    .eyebrow(v-reveal='0') Про мене
    h2.section-title(v-reveal='100') Привіт, я Настя
    p.about__lead(v-reveal='150') Нутриціолог із біологічною освітою. Понад три роки допомагаю налагодити харчування без заборонених продуктів — з повагою до вашого способу життя, з опорою на звички й самопочуття.
    .about__stats
      .stat(v-for='(s, i) in stats' :key='s.value' v-reveal='200 + i * 120')
        .stat__value {{ s.value }}
        .stat__label {{ s.label }}

  .about__card(v-reveal='200')
    .about__card-title Освіта та сертифікати

    .edu
      .edu__icon
        svg(width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true')
          path(d='M22 10 12 5 2 10l10 5 10-5z')
          path(d='M6 12v5c3 2 9 2 12 0v-5')
      div
        .edu__label Вища освіта
        .edu__text «Біологія та здоров’я людини», хімія

    ul.certs
      li.certs__item(v-for='c in certificates' :key='c')
        .certs__icon
          svg(width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true')
            circle(cx='12' cy='9' r='6')
            path(d='M8.5 14 7 22l5-3 5 3-1.5-8')
        span {{ c }}
</template>

<style lang="scss">
@use '@/scss/variables' as *;

.about {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 56px;

  &__intro {
    display: flex;
    flex: 1 1 420px;
    flex-direction: column;
    gap: 20px;
    min-width: 0;

    .eyebrow,
    .section-title {
      margin: 0;
    }
  }

  &__lead {
    color: $text-muted;
    font-size: 18px;
  }

  &__stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
    margin-top: 8px;

    @media (max-width: 480px) {
      grid-template-columns: 1fr;
    }
  }

  &__card {
    flex: 1 1 420px;
    min-width: 0;
    padding: 36px;
    background: $bg-soft;
    border-radius: 28px;

    @media (max-width: $bp-md) {
      padding: 24px;
    }
  }

  &__card-title {
    margin-bottom: 20px;
    font-family: $font-heading;
    font-size: 24px;
    font-weight: 600;
  }
}

.stat {
  padding: 18px;
  border: 1px solid $line;
  border-radius: 18px;
  transition: border-color 0.3s ease, transform 0.3s ease;

  &:hover {
    border-color: $line-input;
    transform: translateY(-3px);
  }

  &__value {
    color: $green-link;
    font-family: $font-heading;
    font-size: 34px;
    line-height: 1.2;
  }

  &__label {
    color: $text-muted;
    font-size: 14px;
    line-height: 1.4;
  }
}

.edu {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  padding: 20px;
  background: $green-dark;
  border-radius: 20px;
  color: #fff;

  &__icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: rgba(255, 255, 255, 0.12);
    border-radius: 14px;
    color: $badge-bg;
  }

  &__label {
    color: $badge-bg;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  &__text {
    font-weight: 600;
    line-height: 1.4;
  }
}

.certs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }

  &__item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    background: $bg;
    border-radius: 16px;
    font-size: 15px;
    font-weight: 500;
    line-height: 1.4;
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 24px rgba($green-dark, 0.08);
    }
  }

  &__icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: $bg-selected;
    border-radius: 50%;
    color: $accent;
  }
}
</style>
