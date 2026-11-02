<script setup lang="ts">
const options = ['Щодня', 'Іноді, коли встигаю', 'Майже ніколи']
</script>

<template lang="pug">
section#quiz.container
  .quiz
    .quiz__info
      .eyebrow Тест за 2 хвилини
      h2.quiz__title Який у вас тип харчових звичок?
      p 7 простих питань — і ви отримаєте результат з порадами та чек-лист «Тарілка здорового харчування» на пошту.
    .quiz__card
      .quiz__meta
        span Питання 2 з 7
        span 28%
      .quiz__bar
        span(style='width: 28%')
      .quiz__question Як часто ви снідаєте?
      button.quiz__option(v-for='(option, i) in options' :key='option' type='button' :class="{ 'quiz__option--active': i === 1 }") {{ option }}
</template>

<style lang="scss">
@use '@/scss/variables' as *;

.quiz {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 40px;
  padding: 48px;
  background: $bg-tint;
  border-radius: 32px;

  @media (max-width: $bp-md) {
    padding: 28px 20px;
  }

  &__info {
    display: flex;
    flex: 1 1 340px;
    flex-direction: column;
    gap: 14px;
    min-width: 0;
    color: $text-nav;

    .eyebrow {
      margin: 0;
    }
  }

  &__title {
    color: $text;
    font-size: 38px;
    line-height: 1.2;

    @media (max-width: $bp-md) {
      font-size: 30px;
    }
  }

  &__card {
    display: flex;
    flex: 1 1 380px;
    flex-direction: column;
    gap: 14px;
    min-width: 0;
    padding: 28px;
    background: $bg;
    border-radius: 24px;
  }

  &__meta {
    display: flex;
    justify-content: space-between;
    color: $text-muted;
    font-size: 14px;
  }

  &__bar {
    height: 6px;
    background: $line;
    border-radius: 3px;

    span {
      display: block;
      height: 100%;
      background: $accent;
      border-radius: 3px;
    }
  }

  &__question {
    font-size: 18px;
    font-weight: 700;
  }

  &__option {
    min-height: 48px;
    padding: 14px 16px;
    background: $bg;
    border: 1px solid $line-green;
    border-radius: 14px;
    color: $text;
    font: inherit;
    text-align: left;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;

    &:hover {
      border-color: $accent;
    }

    &--active {
      padding: 13px 15px;
      background: $bg-selected;
      border: 2px solid $accent;
      font-weight: 600;
    }
  }
}
</style>
