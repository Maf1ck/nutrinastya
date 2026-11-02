<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useScrolled } from '@/composables/useScrolled'
import { CONTACTS } from '@/config/site'

const scrolled = useScrolled(10)
const nav = [
  { href: '#about', label: 'Про мене' },
  { href: '#services', label: 'Послуги' },
  { href: '#quiz', label: 'Тест' },
  { href: '#reviews', label: 'Відгуки' },
  { href: '#faq', label: 'FAQ' },
]

const menuOpen = ref(false)

function close() {
  menuOpen.value = false
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}

// на десктопній ширині меню має закриватися саме
const desktop = typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia('(min-width: 961px)') : null
const onBreakpoint = (e: MediaQueryListEvent) => e.matches && close()

watch(menuOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

onMounted(() => {
  document.addEventListener('keydown', onKey)
  desktop?.addEventListener('change', onBreakpoint)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKey)
  desktop?.removeEventListener('change', onBreakpoint)
  document.body.style.overflow = ''
})
</script>

<template lang="pug">
header.header(:class="{ 'header--scrolled': scrolled || menuOpen, 'header--menu-open': menuOpen }")
  .header__inner
    a.header__logo(href='#' @click='close')
      svg(width='30' height='30' viewBox='0 0 24 24' fill='none' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true')
        path(d='M5 19c0-8 5-13 14-14-1 9-6 14-14 14z')
        path(d='M5 19l7-7')
      span Настя
        span.header__logo-role  · нутриціолог

    nav.header__nav(aria-label='Основна навігація')
      a(v-for='item in nav' :key='item.href' :href='item.href') {{ item.label }}

    .header__actions
      a.btn.btn--primary.header__cta(:href='CONTACTS.telegram' target='_blank' rel='noopener') Записатися
      button.header__burger(
        type='button'
        :aria-expanded='menuOpen'
        aria-controls='mobile-menu'
        :aria-label="menuOpen ? 'Закрити меню' : 'Відкрити меню'"
        @click='menuOpen = !menuOpen'
      )
        span
        span
        span

  Transition(name='mobile-menu')
    nav#mobile-menu.mobile-menu(v-show='menuOpen' aria-label='Мобільна навігація')
      a.mobile-menu__link(
        v-for='(item, i) in nav'
        :key='item.href'
        :href='item.href'
        :style="{ '--i': i }"
        @click='close'
      ) {{ item.label }}
      a.btn.btn--primary.btn--lg.mobile-menu__cta(:href='CONTACTS.telegram' target='_blank' rel='noopener' :style="{ '--i': nav.length }" @click='close') Записатися на консультацію
      .mobile-menu__socials(:style="{ '--i': nav.length + 1 }")
        a(:href='CONTACTS.telegram' target='_blank' rel='noopener') Telegram
        a(:href='CONTACTS.instagram' target='_blank' rel='noopener') Instagram

Teleport(to='body')
  Transition(name='menu-overlay')
    .menu-overlay(v-if='menuOpen' @click='close')
</template>

<style lang="scss">
@use '@/scss/variables' as *;

$ease-out: cubic-bezier(0.22, 1, 0.36, 1);
$bp-menu: 960px;

.header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid $line;
  transition: box-shadow 0.3s ease, background 0.3s ease;

  &--scrolled {
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 6px 24px rgba($green-dark, 0.08);
  }

  &--menu-open {
    background: #fff;
  }

  &__inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    max-width: $container;
    margin: 0 auto;
    padding: 18px 24px;

    @media (max-width: $bp-md) {
      padding: 12px 16px;
    }
  }

  &__logo {
    display: flex;
    align-items: center;
    gap: 10px;
    color: $text;
    font-family: $font-heading;
    font-size: 22px;
    font-weight: 600;
    text-decoration: none;
    white-space: nowrap;

    &:hover {
      color: $text;
    }

    svg {
      flex-shrink: 0;
      stroke: $accent;
    }

    @media (max-width: 400px) {
      font-size: 20px;
    }
  }

  &__logo-role {
    @media (max-width: 360px) {
      display: none;
    }
  }

  &__nav {
    display: flex;
    gap: 24px;
    font-size: 15px;

    @media (max-width: $bp-menu) {
      display: none;
    }

    a {
      position: relative;
      color: $text-nav;
      text-decoration: none;
      transition: color 0.25s ease;

      &::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: -4px;
        width: 100%;
        height: 2px;
        background: $accent;
        border-radius: 1px;
        transform: scaleX(0);
        transform-origin: right;
        transition: transform 0.3s ease;
      }

      &:hover::after {
        transform: scaleX(1);
        transform-origin: left;
      }

      &:hover {
        color: $accent;
      }
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__cta {
    @media (max-width: 560px) {
      display: none;
    }
  }

  // бургер, що перетворюється на хрестик
  &__burger {
    position: relative;
    display: none;
    width: 44px;
    height: 44px;
    padding: 0;
    background: $bg-soft;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transition: background 0.25s ease;

    @media (max-width: $bp-menu) {
      display: block;
    }

    &:hover {
      background: $bg-tint;
    }

    span {
      position: absolute;
      left: 13px;
      width: 18px;
      height: 2px;
      background: $text;
      border-radius: 1px;
      transition: transform 0.35s $ease-out, opacity 0.2s ease, top 0.35s $ease-out;

      &:nth-child(1) {
        top: 15px;
      }

      &:nth-child(2) {
        top: 21px;
      }

      &:nth-child(3) {
        top: 27px;
      }
    }
  }

  &--menu-open &__burger span {
    &:nth-child(1) {
      top: 21px;
      transform: rotate(45deg);
    }

    &:nth-child(2) {
      opacity: 0;
      transform: scaleX(0);
    }

    &:nth-child(3) {
      top: 21px;
      transform: rotate(-45deg);
    }
  }
}

.mobile-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  max-height: calc(100dvh - 68px);
  padding: 8px 24px 28px;
  overflow-y: auto;
  background: #fff;
  border-bottom: 1px solid $line;
  box-shadow: 0 24px 40px rgba($green-dark, 0.12);

  @media (min-width: #{$bp-menu + 1}) {
    display: none !important;
  }

  &__link {
    padding: 16px 0;
    border-bottom: 1px solid $line;
    color: $text;
    font-family: $font-heading;
    font-size: 24px;
    font-weight: 600;
    text-decoration: none;
    transition: color 0.2s ease, padding-left 0.3s $ease-out;

    &:hover {
      padding-left: 6px;
      color: $accent;
    }
  }

  &__cta {
    margin-top: 24px;
  }

  &__socials {
    display: flex;
    justify-content: center;
    gap: 24px;
    margin-top: 18px;
    font-weight: 600;
  }

  // пункти з'являються по черзі
  &__link,
  &__cta,
  &__socials {
    transition-property: color, padding-left, opacity, transform;
  }
}

.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: clip-path 0.45s $ease-out;

  .mobile-menu__link,
  .mobile-menu__cta,
  .mobile-menu__socials {
    transition:
      opacity 0.4s ease calc(var(--i) * 50ms + 100ms),
      transform 0.45s $ease-out calc(var(--i) * 50ms + 100ms);
  }
}

.mobile-menu-leave-active {
  transition-duration: 0.3s;

  .mobile-menu__link,
  .mobile-menu__cta,
  .mobile-menu__socials {
    transition-delay: 0s;
    transition-duration: 0.15s;
  }
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  clip-path: inset(0 0 100% 0);

  .mobile-menu__link,
  .mobile-menu__cta,
  .mobile-menu__socials {
    opacity: 0;
    transform: translateY(-12px);
  }
}

.mobile-menu-enter-to,
.mobile-menu-leave-from {
  clip-path: inset(0 0 0 0);
}

.menu-overlay {
  position: fixed;
  inset: 0;
  z-index: 40;
  background: rgba(10, 26, 17, 0.4);
  backdrop-filter: blur(2px);
}

.menu-overlay-enter-active,
.menu-overlay-leave-active {
  transition: opacity 0.3s ease;
}

.menu-overlay-enter-from,
.menu-overlay-leave-to {
  opacity: 0;
}
</style>
