<script setup lang="ts">
import { useScrolled } from '@/composables/useScrolled'

const visible = useScrolled(600)

function toTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template lang="pug">
Transition(name='scroll-top')
  button.scroll-top(v-show='visible' type='button' aria-label='Нагору' @click='toTop')
    svg(width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true')
      path(d='M12 19V5')
      path(d='M5 12l7-7 7 7')
</template>

<style lang="scss">
@use '@/scss/variables' as *;

.scroll-top {
  position: fixed;
  right: 24px;
  bottom: 24px;

  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  background: $accent;
  border: none;
  border-radius: 50%;
  box-shadow: 0 8px 24px rgba($green-dark, 0.3);
  color: #fff;
  cursor: pointer;
  transition: transform 0.25s ease, background 0.25s ease;

  &:hover {
    background: $green-link-hover;
    transform: translateY(-3px);
  }

  &:active {
    transform: scale(0.94);
  }

  @media (max-width: $bp-md) {
    right: 16px;
    bottom: 16px;
    width: 46px;
    height: 46px;
  }
}

.scroll-top-enter-active,
.scroll-top-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.scroll-top-enter-from,
.scroll-top-leave-to {
  opacity: 0;
  transform: translateY(16px) scale(0.9);
}
</style>
