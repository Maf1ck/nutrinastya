<template lang="pug">
footer#contact.footer
  .footer__inner(v-reveal='0')
    div
      h2.footer__title Почнімо з безкоштовної розмови
      p.footer__contacts [Телефон] · [Email] · онлайн по всій Україні
    .footer__actions
      a.btn.btn--white(href='#') Записатися
      a.btn.btn--ghost(href='#') Telegram
      a.btn.btn--ghost(href='#') Instagram
</template>

<style lang="scss">
@use '@/scss/variables' as *;

.footer {
  background: $green-dark;
  color: #fff;

  &__inner {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    max-width: $container;
    margin: 0 auto;
    padding: 64px 24px;
  }

  &__title {
    margin-bottom: 8px;
    font-size: 36px;

    @media (max-width: $bp-md) {
      font-size: 28px;
    }
  }

  &__contacts {
    color: $text-on-dark;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;

    .btn {
      padding: 15px 26px;
    }
  }
}
</style>
