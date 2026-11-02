<script setup lang="ts">
import { DEVELOPER } from '@/config/site'

// 4 однакові копії: трек зсувається на -25% і безшовно повторюється
const copies = 4
</script>

<template lang="pug">
.dev-ticker
  .dev-ticker__track
    .dev-ticker__item(v-for='i in copies' :key='i' :aria-hidden='i > 1 ? "true" : undefined')
      | Сайт створено, щоб здорове харчування було простим і доступним. Розробник tg:
      |
      a(:href='DEVELOPER.telegram' target='_blank' rel='noopener' :tabindex='i > 1 ? -1 : undefined') {{ DEVELOPER.telegramHandle }}
</template>

<style lang="scss">
@use '@/scss/variables' as *;

.dev-ticker {
  overflow: hidden;
  padding: 9px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  background: #183d28;

  &__track {
    display: flex;
    width: max-content;
    animation: dev-ticker 30s linear infinite;

    &:hover {
      animation-play-state: paused;
    }

    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  }

  &__item {
    padding: 0 40px;
    color: $text-on-dark;
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;

    a {
      color: $badge-bg;
      font-weight: 700;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

@keyframes dev-ticker {
  to {
    transform: translate3d(-25%, 0, 0);
  }
}
</style>
