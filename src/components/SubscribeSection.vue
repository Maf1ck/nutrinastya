<template lang="pug">
section.section.section--soft
  .container.subscribe(v-reveal='0')
    .subscribe__info
      h2 Безкоштовне меню на 3 дні
      p Прості рецепти та список покупок — надішлю на пошту.
    form.subscribe__form(@submit.prevent)
      label.subscribe__field Ваш email
        input(type='email' placeholder='name@gmail.com')
      button.btn.btn--primary(type='submit') Отримати
</template>

<style lang="scss">
@use '@/scss/variables' as *;

.subscribe {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  padding-top: 72px;
  padding-bottom: 72px;

  &__info {
    flex: 1 1 380px;
    min-width: 0;

    h2 {
      margin-bottom: 8px;
      font-size: 32px;
    }

    p {
      color: $text-muted;
    }
  }

  &__form {
    display: flex;
    flex: 1 1 380px;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 10px;
    min-width: 0;
  }

  &__field {
    display: flex;
    flex: 1 1 220px;
    flex-direction: column;
    gap: 6px;
    color: $text-nav;
    font-size: 14px;

    input {
      min-height: 48px;
      padding: 13px 16px;
      background: $bg;
      border: 1px solid $line-input;
      border-radius: $pill;
      color: $text;
      font: inherit;

      &:focus {
        outline: 2px solid $accent;
        outline-offset: 1px;
      }
    }
  }

  .btn {
    min-height: 48px;
    padding: 14px 24px;
    font-weight: 700;
  }
}
</style>
