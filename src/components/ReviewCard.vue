<script setup lang="ts">
withDefaults(
  defineProps<{
    text?: string
    name?: string
    format?: string
  }>(),
  {
    text: '[Відгук клієнта про зміни в самопочутті та звичках.]',
    name: "[Ім'я]",
    format: '[формат роботи]',
  },
)
</script>

<template lang="pug">
.review
  p.review__text «{{ text }}»
  .review__author
    b {{ name }}
    |  · {{ format }}
</template>

<style lang="scss">
@use '@/scss/variables' as *;

.review {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 26px;
  border: 1px solid $line;
  border-radius: 22px;

  &__text {
    font-family: $font-heading;
    font-size: 18px;
  }

  &__author {
    color: $text-muted;
    font-size: 14px;

    b {
      color: $text;
    }
  }
}
.review {
  transition: border-color 0.3s ease, transform 0.3s ease;

  &:hover {
    border-color: $line-input;
    transform: translateY(-4px);
  }
}
</style>
