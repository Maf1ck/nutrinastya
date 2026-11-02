<script setup lang="ts">
defineProps<{
  number: number
  title: string
  text: string
}>()
</script>

<template lang="pug">
.step
  .step__num {{ number }}
  h3.step__title {{ title }}
  p.step__text {{ text }}
</template>

<style lang="scss">
@use '@/scss/variables' as *;

.step {
  padding: 24px;
  background: $bg;
  border-radius: 22px;

  &__num {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    background: $accent;
    border-radius: 50%;
    color: #fff;
    font-weight: 700;
  }

  &__title {
    margin: 14px 0 6px;
    font-size: 18px;
  }

  &__text {
    color: $text-muted;
  }
}
</style>
