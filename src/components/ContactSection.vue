<script setup lang="ts">
import { CONTACTS } from '@/config/site'
</script>

<template lang="pug">
section#contact.container
  .contact(v-reveal='0')
    .contact__info
      .eyebrow Запис
      h2.contact__title Почнімо з безкоштовної розмови
      p.contact__text Напишіть мені в Telegram — разом оберемо формат і зручний час. Перша розмова 15 хв безкоштовна.
      ul.contact__points
        li Онлайн у Zoom або Telegram
        li По всій Україні та за кордоном
        li Без зобов’язань купувати супровід

    .contact__card
      .contact__avatar
        svg(width='34' height='34' viewBox='0 0 24 24' fill='currentColor' aria-hidden='true')
          path(d='M21.9 4.3 18.6 19.8c-.2 1.1-.9 1.4-1.8.9l-5-3.7-2.4 2.3c-.3.3-.5.5-1 .5l.4-5.1 9.2-8.3c.4-.4-.1-.6-.6-.2L6 13.4l-4.9-1.5c-1.1-.3-1.1-1.1.2-1.6l19.1-7.4c.9-.3 1.7.2 1.5 1.4z')
      .contact__handle {{ CONTACTS.telegramHandle }}
      p.contact__hint Відповідаю протягом дня
      a.btn.btn--primary.btn--lg.contact__cta(:href='CONTACTS.telegram' target='_blank' rel='noopener') Написати в Telegram
      a.contact__alt(:href='CONTACTS.instagram' target='_blank' rel='noopener') або в Instagram {{ CONTACTS.instagramHandle }}
</template>

<style lang="scss">
@use '@/scss/variables' as *;

.contact {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 48px;
  padding: 56px;
  background: $green-dark;
  border-radius: 32px;
  color: #fff;

  @media (max-width: $bp-md) {
    gap: 32px;
    padding: 28px 20px;
  }

  &__info {
    display: flex;
    flex: 1 1 340px;
    flex-direction: column;
    gap: 16px;
    min-width: 0;

    .eyebrow {
      margin: 0;
      color: $badge-bg;
    }
  }

  &__title {
    font-size: 40px;
    line-height: 1.15;

    @media (max-width: $bp-md) {
      font-size: 30px;
    }
  }

  &__text {
    color: $text-on-dark;
    font-size: 17px;
  }

  &__points {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 8px 0 0;
    padding: 0;
    list-style: none;

    li {
      position: relative;
      padding-left: 30px;

      &::before {
        content: '✓';
        position: absolute;
        top: 1px;
        left: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        background: $badge-bg;
        border-radius: 50%;
        color: $green-dark;
        font-size: 12px;
        font-weight: 700;
      }
    }
  }

  &__card {
    display: flex;
    flex: 1 1 340px;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    min-width: 0;
    padding: 40px 32px;
    background: $bg;
    border-radius: 24px;
    color: $text;
    text-align: center;

    @media (max-width: $bp-md) {
      padding: 28px 20px;
    }
  }

  &__avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 76px;
    height: 76px;
    margin-bottom: 10px;
    background: $bg-selected;
    border-radius: 50%;
    color: $accent;
    animation: contact-pulse 2.4s ease-in-out infinite;
  }

  &__handle {
    font-family: $font-heading;
    font-size: 28px;
    font-weight: 600;
  }

  &__hint {
    color: $text-muted;
    font-size: 15px;
  }

  &__cta {
    width: 100%;
    margin-top: 18px;
  }

  &__alt {
    margin-top: 10px;
    font-size: 15px;
    font-weight: 600;
  }
}

@keyframes contact-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba($accent, 0.35);
  }

  50% {
    box-shadow: 0 0 0 14px rgba($accent, 0);
  }
}
</style>
