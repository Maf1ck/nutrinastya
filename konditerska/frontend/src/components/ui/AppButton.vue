<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

withDefaults(
  defineProps<{
    variant?: 'dark' | 'accent' | 'outline' | 'outline-light'
    block?: boolean
    to?: RouteLocationRaw
    type?: 'button' | 'submit'
    disabled?: boolean
  }>(),
  { variant: 'dark', type: 'button' },
)
</script>

<template lang="pug">
router-link.btn(
  v-if="to"
  :to="to"
  :class="[`btn--${variant}`, { 'btn--block': block }]"
)
  slot
button.btn(
  v-else
  :type="type"
  :disabled="disabled"
  :class="[`btn--${variant}`, { 'btn--block': block }]"
)
  slot
</template>

<style lang="scss" scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $s-8;
  padding: 14px $s-28;
  border: 1px solid transparent;
  border-radius: $r-pill;
  font-family: $font-sans;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.2;
  white-space: nowrap;
  transition:
    background-color 0.2s,
    color 0.2s,
    border-color 0.2s,
    opacity 0.2s,
    transform 0.15s;

  &:active:not(:disabled) {
    transform: scale(0.96);
  }

  &--block {
    width: 100%;
  }

  &--dark {
    background: $c-ink;
    color: $c-bg;
    @include hover-only {
      background: $c-ink-dark;
    }
  }

  &--accent {
    background: $c-accent;
    color: $c-ink-dark;
    @include hover-only {
      background: color-mix(in srgb, var(--c-accent) 86%, white);
    }
  }

  &--outline {
    border-color: $c-line;
    color: $c-ink;
    @include hover-only {
      border-color: $c-ink;
    }
  }

  &--outline-light {
    border-color: $c-bg;
    color: $c-bg;
    @include hover-only {
      background: rgb(244 239 230 / 12%);
    }
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
}
</style>
