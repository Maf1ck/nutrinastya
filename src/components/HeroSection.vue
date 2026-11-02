<script setup lang="ts">
import { CONTACTS } from '@/config/site'

const photo = `${import.meta.env.BASE_URL}imghero.JPG`
</script>

<template lang="pug">
section.section.section--soft.hero
  .hero__inner
    .hero__content
      .hero__badge Нутриціолог · онлайн по всій Україні
      h1.hero__title Харчування без жорстких дієт і зривів
      p.hero__text Я, Настя, допоможу налагодити раціон під ваш ритм життя: більше енергії, спокійні стосунки з їжею та звички, що залишаються надовго.
      .hero__actions
        a.btn.btn--primary.btn--lg(:href='CONTACTS.telegram' target='_blank' rel='noopener') Безкоштовна консультація 15 хв
        a.btn.btn--outline.btn--lg(href='#quiz') Пройти тест
    .hero__photo
      img.hero__img(:src='photo' alt='Настя — нутриціолог' width='3554' height='5332' fetchpriority='high')
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

    @media (max-width: $bp-md) {
      gap: 32px;
      padding: 36px 16px 56px;
    }
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

    @media (max-width: $bp-md) {
      font-size: 17px;
    }
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;

    @media (max-width: 480px) {
      flex-direction: column;

      .btn {
        width: 100%;
      }
    }
  }

  &__img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 50% 22%;
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
    overflow: hidden;

    @media (max-width: $bp-md) {
      height: 420px;
      border-radius: 22px;
    }
    background: $bg-tint;
    border-radius: 28px;
    color: #4a6b53;
    font-size: 15px;
  }
}
@keyframes hero-fade-up {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
}

@keyframes hero-photo-in {
  from {
    opacity: 0;
    transform: scale(0.94);
  }
}

.hero__content > * {
  animation: hero-fade-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;

  @for $i from 1 through 4 {
    &:nth-child(#{$i}) {
      animation-delay: #{($i - 1) * 0.12}s;
    }
  }
}

.hero__photo {
  animation: hero-photo-in 1s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both;
}

.hero__img {
  transition: transform 1.2s cubic-bezier(0.22, 1, 0.36, 1);
}

.hero__photo:hover .hero__img {
  transform: scale(1.04);
}
</style>
