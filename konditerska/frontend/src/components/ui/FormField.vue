<script setup lang="ts">
import { useId } from 'vue'

defineProps<{ label: string; error?: string }>()

const id = useId()
</script>

<template lang="pug">
.field
  label.field__label(:for="id") {{ label }}
  slot(:id="id" :invalid="Boolean(error)" :described-by="error ? `${id}-error` : undefined")
  p.field__error(v-if="error" :id="`${id}-error`" role="alert") {{ error }}
</template>

<style lang="scss" scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: $s-8;
  min-width: 0;

  &__label {
    font-size: 14px;
    font-weight: 600;
  }

  &__error {
    color: $c-danger;
    font-size: 13px;
  }

  :slotted(input),
  :slotted(select),
  :slotted(textarea) {
    width: 100%;
    padding: 14px $s-16;
    border: 1px solid $c-line;
    border-radius: $r-input;
    background: $c-bg;
    font-size: 15px;
    line-height: 1.4;
    transition: border-color 0.2s;

    &::placeholder {
      color: $c-muted;
    }

    &:focus-visible {
      border-color: $c-ink;
      outline: none;
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--c-accent) 45%, transparent);
    }

    &[aria-invalid='true'] {
      border-color: $c-danger;
    }

    &:disabled {
      color: $c-muted;
      cursor: not-allowed;
    }
  }

  :slotted(textarea) {
    min-height: 96px;
    resize: vertical;
  }
}
</style>
