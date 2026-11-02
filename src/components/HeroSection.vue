<template lang="pug">
section.section.section--soft.hero
  .hero__inner
    .hero__content
      .hero__badge Нутриціолог · онлайн по всій Україні
      h1.hero__title Харчування без жорстких дієт і зривів
      p.hero__text Допоможу налагодити раціон під ваш ритм життя: більше енергії, спокійні стосунки з їжею та звички, що залишаються надовго.
      .hero__actions
        a.btn.btn--primary.btn--lg(href='#contact') Безкоштовна консультація 15 хв
        a.btn.btn--outline.btn--lg(href='#quiz') Пройти тест
    .hero__photo
      svg(width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.5' aria-hidden='true')
        rect(x='3' y='5' width='18' height='14' rx='2')
        circle(cx='9' cy='10' r='2')
        path(d='M21 16l-5-5-8 8')
      div Фото нутриціолога
</template>

<style lang="scss">
@use '@/scss/variables' as *;

.hero {
  &__inner {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 48px;
    max-width: $container;
    margin: 0 auto;
    padding: 72px 24px 88px;
  }

  &__content {
    display: flex;
    flex: 1 1 460px;
    flex-direction: column;
    gap: 22px;
    min-width: 0;
  }

  &__badge {
    align-self: flex-start;
    padding: 6px 14px;
    background: $bg;
    border: 1px solid $line-green;
    border-radius: $pill;
    color: $green-link;
    font-size: 14px;
    font-weight: 600;
  }

  &__title {
    color: $text-heading;
    font-size: clamp(38px, 5vw, 58px);
    line-height: 1.1;
  }

  &__text {
    max-width: 520px;
    color: $text-muted;
    font-size: 19px;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
  }

  &__photo {
    display: flex;
    flex: 1 1 380px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    min-width: 0;
    height: 470px;
    background: $bg-tint;
    border-radius: 28px;
    color: #4a6b53;
    font-size: 15px;
  }
}
</style>
