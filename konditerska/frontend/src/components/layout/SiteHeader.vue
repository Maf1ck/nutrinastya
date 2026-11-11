<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppLogo from '@/components/ui/AppLogo.vue'
import CategoryNav from '@/components/layout/CategoryNav.vue'
import InfoBar from '@/components/layout/InfoBar.vue'
import { useCartStore } from '@/stores/cart'
import { useSiteStore } from '@/stores/site'

const site = useSiteStore()
const cart = useCartStore()
const route = useRoute()
const menuOpen = ref(false)

watch(() => route.fullPath, () => (menuOpen.value = false))

function phoneHref(phone: string): string | undefined {
  const digits = phone.replace(/[^\d+]/g, '')
  return /^\+?\d{9,}$/.test(digits) ? `tel:${digits}` : undefined
}
</script>

<template lang="pug">
header.header
  info-bar
  .header__main.container
    app-logo
    .header__actions
      a.header__phone(:href="phoneHref(site.settings?.phone ?? '')") {{ site.settings?.phone }}
      router-link.header__cart(:to="{ name: 'cart' }" :aria-label="`Кошик, товарів: ${cart.totalQty}`")
        | Кошик · 
        span.header__count(:key="cart.totalQty" :class="{ 'is-bump': cart.totalQty > 0 }") {{ cart.totalQty }}
      button.header__burger(
        type="button"
        :aria-expanded="menuOpen"
        aria-controls="mobile-menu"
        :aria-label="menuOpen ? 'Закрити меню' : 'Відкрити меню'"
        @click="menuOpen = !menuOpen"
      )
        span.header__burger-lines(:class="{ 'is-open': menuOpen }")
  transition(name="menu")
    #mobile-menu.menu(v-show="menuOpen")
      .container
        a.menu__phone(:href="phoneHref(site.settings?.phone ?? '')") {{ site.settings?.phone }}
        router-link.menu__link(:to="{ name: 'catalog' }") Увесь каталог
        router-link.menu__link(:to="{ name: 'home', hash: '#how' }") Як замовити
  category-nav
</template>

<style lang="scss" scoped>
.header {
  background: $c-bg;

  &__main {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $s-16;
    padding-block: $s-16;
    @include up($bp-md) {
      padding-block: $s-20;
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: $s-12;
    @include up($bp-md) {
      gap: $s-24;
    }
  }

  &__phone {
    display: none;
    font-size: 15px;
    font-weight: 600;
    @include up($bp-md) {
      display: block;
    }
  }

  &__cart {
    padding: 10px $s-20;
    border-radius: $r-pill;
    background: $c-ink;
    color: $c-bg;
    font-size: 14px;
    font-weight: 700;
    white-space: nowrap;
    transition: background-color 0.2s;
    @include up($bp-md) {
      padding: $s-12 22px;
      font-size: 15px;
    }

    @include hover-only {
      background: $c-ink-dark;
    }
  }

  &__count {
    display: inline-block;

    &.is-bump {
      animation: pop 0.4s ease;
    }
  }

  &__burger {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    border: 1px solid $c-line;
    border-radius: $r-pill;
    @include up($bp-md) {
      display: none;
    }
  }

  &__burger-lines {
    position: relative;
    width: 18px;
    height: 2px;
    background: $c-ink;
    transition: background-color 0.2s;

    &::before,
    &::after {
      content: '';
      position: absolute;
      left: 0;
      width: 18px;
      height: 2px;
      background: $c-ink;
      transition: transform 0.2s;
    }
    &::before {
      top: -6px;
    }
    &::after {
      top: 6px;
    }

    &.is-open {
      background: transparent;
      &::before {
        transform: translateY(6px) rotate(45deg);
      }
      &::after {
        transform: translateY(-6px) rotate(-45deg);
      }
    }
  }
}

.menu-enter-active,
.menu-leave-active {
  transition:
    opacity 0.2s,
    transform 0.2s;
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.menu {
  border-top: 1px solid $c-line;
  @include up($bp-md) {
    display: none !important;
  }

  .container {
    display: flex;
    flex-direction: column;
    gap: $s-4;
    padding-block: $s-12;
  }

  &__phone,
  &__link {
    padding: $s-12 0;
    font-size: 16px;
    font-weight: 600;
  }
}
</style>
