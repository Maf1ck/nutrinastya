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
.step {
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba($green-dark, 0.1);
  }

  &__num {
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  &:hover &__num {
    transform: scale(1.12) rotate(-6deg);
  }
}
</style>
