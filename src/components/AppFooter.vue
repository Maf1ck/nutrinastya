<script setup lang="ts">
import { CONTACTS, LEGAL_LINKS, OWNER } from '@/config/site'
import DevTicker from './DevTicker.vue'

const year = new Date().getFullYear()
const nav = [
  { href: '/#about', label: 'Про мене' },
  { href: '/#services', label: 'Послуги' },
  { href: '/#quiz', label: 'Тест' },
  { href: '/#reviews', label: 'Відгуки' },
  { href: '/#faq', label: 'FAQ' },
  { href: '/blog', label: 'Блог' },
]
</script>

<template lang="pug">
DevTicker
footer.footer
  .footer__inner
    .footer__brand
      RouterLink.footer__logo(to='/')
        svg(width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true')
          path(d='M5 19c0-8 5-13 14-14-1 9-6 14-14 14z')
          path(d='M5 19l7-7')
        | Анастасія · нутриціолог
      p.footer__about Харчування без жорстких дієт і зривів. Онлайн-консультації по всій Україні та за кордоном.
      a.btn.btn--white.footer__cta(:href='CONTACTS.telegram' target='_blank' rel='noopener') Записатися в Telegram

    .footer__col
      .footer__heading Навігація
      a(v-for='item in nav' :key='item.href' :href='item.href') {{ item.label }}

    .footer__col
      .footer__heading Документи
      RouterLink(v-for='l in LEGAL_LINKS' :key='l.to' :to='l.to') {{ l.label }}

    .footer__col
      .footer__heading Контакти
      a(:href='CONTACTS.telegram' target='_blank' rel='noopener') Telegram {{ CONTACTS.telegramHandle }}
      a(:href='CONTACTS.instagram' target='_blank' rel='noopener') Instagram {{ CONTACTS.instagramHandle }}

  .footer__bottom
    p © {{ year }}, Анастасія · нутриціолог ({{ OWNER.name }}). Всі права захищені.
    p.footer__disclaimer Інформація на сайті має ознайомчий характер, не є медичною консультацією і не замінює візиту до лікаря.
</template>

<style lang="scss">
@use '@/scss/variables' as *;

.footer {
  background: $green-dark;
  color: #fff;

  // звичайні посилання; кнопки (.btn) зберігають власні кольори
  a:not(.btn) {
    color: $text-on-dark;
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: #fff;
    }
  }

  &__inner {
    display: grid;
    grid-template-columns: 1.6fr repeat(3, 1fr);
    gap: 40px;
    max-width: $container;
    margin: 0 auto;
    padding: 64px 24px 40px;

    @media (max-width: 960px) {
      grid-template-columns: repeat(3, 1fr);
    }

    @media (max-width: 640px) {
      grid-template-columns: 1fr 1fr;
      gap: 32px 20px;
      padding: 48px 16px 32px;
    }
  }

  &__brand {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;

    @media (max-width: 960px) {
      grid-column: 1 / -1;
    }
  }

  &__logo {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: $font-heading;
    font-size: 22px;
    font-weight: 600;

    &,
    &:hover {
      color: #fff;
    }

    svg {
      color: $badge-bg;
    }
  }

  &__about {
    max-width: 340px;
    color: $text-on-dark;
    font-size: 15px;
  }

  &__cta {
    margin-top: 6px;
  }

  &__col {
    display: flex;
    flex-direction: column;
    gap: 10px;
    font-size: 15px;

    @media (max-width: 640px) {
      &:last-child {
        grid-column: 1 / -1;
      }
    }
  }

  &__heading {
    margin-bottom: 4px;
    color: $badge-bg;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 1.2px;
    text-transform: uppercase;
  }

  &__bottom {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-width: $container;
    margin: 0 auto;
    padding: 22px 24px 30px;
    border-top: 1px solid rgba(255, 255, 255, 0.12);
    color: $text-on-dark;
    font-size: 13px;

    @media (max-width: 640px) {
      padding: 20px 16px 80px;
    }
  }

  &__disclaimer {
    opacity: 0.75;
  }
}
</style>
