<script setup lang="ts" generic="T extends string">
// Pill-shaped segmented control: product state (fresh / frozen) and catalog state filter.
defineProps<{
  options: { value: T; label: string; disabled?: boolean }[]
  label: string
  size?: 'md' | 'sm'
}>()

const model = defineModel<T>({ required: true })
</script>

<template lang="pug">
.toggle(role="radiogroup" :aria-label="label" :class="`toggle--${size ?? 'md'}`")
  button.toggle__option(
    v-for="option in options"
    :key="option.value"
    type="button"
    role="radio"
    :aria-checked="model === option.value"
    :disabled="option.disabled"
    :class="{ 'is-active': model === option.value }"
    @click="model = option.value"
  ) {{ option.label }}
</template>

<style lang="scss" scoped>
.toggle {
  display: inline-flex;
  gap: $s-4;
  padding: $s-4;
  border-radius: $r-pill;
  background: $c-bg-alt;
  max-width: 100%;

  &__option {
    padding: $s-8 $s-16;
    border-radius: $r-pill;
    color: $c-muted;
    font-size: 13px;
    font-weight: 600;
    line-height: 1.2;
    white-space: nowrap;
    transition:
      background-color 0.2s,
      color 0.2s;

    &.is-active {
      background: $c-ink;
      color: $c-bg;
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }

  &--sm &__option {
    padding-inline: $s-12;
  }
}
</style>
