<script setup lang="ts">
export interface ClientResult {
  name: string
  period: string
  metrics: string[]
  request: string
  quote?: string
  note?: string
  screenshot: string
}

defineProps<{ result: ClientResult }>()
defineEmits<{ open: [] }>()
</script>

<template lang="pug">
article.result
  .result__head
    h3.result__name {{ result.name }}
    span.result__period {{ result.period }}
  ul.result__metrics
    li(v-for='m in result.metrics' :key='m') {{ m }}
  .result__request
    .result__label Запит
    p {{ result.request }}
  p.result__note(v-if='result.note') {{ result.note }}
  blockquote.result__quote(v-if='result.quote') «{{ result.quote }}»
  button.result__more(type='button' @click="$emit('open')")
    svg(width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true')
      path(d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z')
    | Дивитись переписку
</template>

<style lang="scss">
@use '@/scss/variables' as *;

.result {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  padding: 26px;
  background: $bg;
  border: 1px solid $line;
  border-radius: 24px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    border-color: $line-input;
    box-shadow: 0 14px 36px rgba($green-dark, 0.08);
  }

  &__head {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
  }

  &__name {
    font-family: $font-heading;
    font-size: 24px;
    font-weight: 600;
  }

  &__period {
    color: $text-muted;
    font-size: 14px;
  }

  &__metrics {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;

    li {
      padding: 6px 12px;
      background: $green-dark;
      border-radius: $pill;
      color: #fff;
      font-size: 15px;
      font-weight: 700;
    }
  }

  &__request {
    padding: 14px 16px;
    background: $bg-soft;
    border-radius: 14px;

    p {
      color: $text-nav;
      font-size: 15px;
      line-height: 1.5;
    }
  }

  &__label {
    margin-bottom: 2px;
    color: $green-link;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  &__note {
    color: $text-muted;
    font-size: 15px;
  }

  &__quote {
    margin: 0;
    font-family: $font-heading;
    font-size: 17px;
    line-height: 1.5;
  }

  &__more {
    display: inline-flex;
    align-self: flex-start;
    align-items: center;
    gap: 8px;
    margin-top: auto;
    padding: 0;
    background: none;
    border: none;
    color: $green-link;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
    transition: gap 0.25s ease, color 0.25s ease;

    &:hover {
      gap: 12px;
      color: $green-link-hover;
    }
  }
}
</style>
