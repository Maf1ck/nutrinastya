<script setup lang="ts">
const faq = [
  { q: 'Чи потрібно відмовлятися від улюблених продуктів?', a: 'Ні. Ми шукаємо баланс, а не заборони.' },
  { q: 'Як проходять консультації?', a: 'Онлайн у Zoom або Telegram, запис — у зручний для вас час.' },
  { q: 'Чи працюєте ви із захворюваннями?', a: 'Лише разом із рекомендаціями вашого лікаря. Нутриціолог не ставить діагнозів.' },
]
</script>

<template lang="pug">
section#faq.container
  h2.section-title Часті питання
  .faq
    .faq__item(v-for='item in faq' :key='item.q')
      .faq__q {{ item.q }}
      p {{ item.a }}
</template>

<style lang="scss">
@use '@/scss/variables' as *;

.faq {
  &__item {
    padding: 20px 0;
    border-top: 1px solid $line;

    &:last-child {
      border-bottom: 1px solid $line;
    }

    p {
      color: $text-muted;
    }
  }

  &__q {
    margin-bottom: 6px;
    font-size: 18px;
    font-weight: 700;
  }
}
</style>
