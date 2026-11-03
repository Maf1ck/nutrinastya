<script setup lang="ts">
import { ref } from 'vue'
import ImageLightbox, { type LightboxItem } from './ImageLightbox.vue'

const stats = [
  { value: '3+', label: 'роки практики' },
  { value: '100+', label: 'клієнтів' },
  { value: '5', label: 'дипломів і сертифікатів' },
]

const base = import.meta.env.BASE_URL
const certificates: LightboxItem[] = [
  { title: 'Нутриціологія. Basic Level', meta: 'NUTRI LAB · 70 годин · 2024', src: `${base}photo_1_2026-11-02_12-24-08.jpg` },
  { title: 'Спортивна нутриціологія', meta: 'NUTRI LAB · 70 годин · 2025', src: `${base}photo_2_2026-11-02_12-24-08.jpg` },
  { title: 'Нутриціологія. Professional Level', meta: 'NUTRI LAB · 35 годин · 2025', src: `${base}photo_4_2026-11-02_12-24-08.jpg` },
  { title: 'Аутоімунні захворювання: від причин до харчової підтримки', meta: 'NUTRI LAB · практикум · 2026', src: `${base}photo_3_2026-11-02_12-24-08.jpg` },
]

const active = ref<number | null>(null)
</script>

<template lang="pug">
section#about.container.about
  .about__intro
    .eyebrow(v-reveal='0') Про мене
    h2.section-title(v-reveal='100') Привіт, я Анастасія
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
      li(v-for='(c, i) in certificates' :key='c.src')
        button.certs__item(type='button' :aria-label="'Переглянути сертифікат: ' + c.title" @click='active = i')
          .certs__thumb
            img(:src='c.src' :alt='c.title' loading='lazy')
            span.certs__zoom(aria-hidden='true')
              svg(width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' aria-hidden='true')
                circle(cx='11' cy='11' r='7')
                path(d='m20 20-3.5-3.5M11 8v6M8 11h6')
          .certs__title {{ c.title }}
          .certs__meta {{ c.meta }}

  ImageLightbox(v-model='active' :items='certificates')
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

  li {
    display: flex;
  }

  &__item {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 4px;
    padding: 10px 10px 14px;
    background: $bg;
    border: none;
    border-radius: 16px;
    color: $text;
    font: inherit;
    text-align: left;
    cursor: zoom-in;
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 24px rgba($green-dark, 0.1);
    }

    &:focus-visible {
      outline: 2px solid $accent;
      outline-offset: 2px;
    }
  }

  &__thumb {
    position: relative;
    margin-bottom: 6px;
    overflow: hidden;
    aspect-ratio: 1.42;
    border: 1px solid $line;
    border-radius: 10px;

    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
    }
  }

  &__zoom {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba($green-dark, 0.45);
    color: #fff;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &__item:hover &__thumb img {
    transform: scale(1.06);
  }

  &__item:hover &__zoom {
    opacity: 1;
  }

  &__title {
    padding: 0 4px;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.35;
  }

  &__meta {
    padding: 0 4px;
    color: $text-muted;
    font-size: 12px;
  }
}
</style>
