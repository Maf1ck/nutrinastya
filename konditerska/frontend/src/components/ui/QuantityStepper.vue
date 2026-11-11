<script setup lang="ts">
defineProps<{ name: string }>()

const model = defineModel<number>({ required: true })
</script>

<template lang="pug">
.stepper(role="group" :aria-label="`Кількість: ${name}`")
  button.stepper__btn(type="button" :aria-label="`Зменшити кількість: ${name}`" @click="model -= 1") −
  span.stepper__value(aria-live="polite") {{ model }}
  button.stepper__btn(type="button" :aria-label="`Збільшити кількість: ${name}`" @click="model += 1") +
</template>

<style lang="scss" scoped>
.stepper {
  display: inline-flex;
  align-items: center;
  gap: $s-8;
  padding: $s-4;
  border: 1px solid $c-line;
  border-radius: $r-pill;
  font-weight: 700;

  &__btn {
    width: 32px;
    height: 32px;
    border-radius: $r-pill;
    font-size: 18px;
    line-height: 1;
    transition: background-color 0.2s;

    @include hover-only {
      background: $c-bg-alt;
    }
  }

  &__value {
    min-width: 20px;
    text-align: center;
    font-size: 16px;
  }
}
</style>
