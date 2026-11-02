<script setup lang="ts">
import { computed, onBeforeUnmount, watch } from 'vue'

export interface LightboxItem {
  title: string
  meta: string
  src: string
}

const props = defineProps<{ items: LightboxItem[] }>()
const index = defineModel<number | null>({ required: true })

const current = computed(() => (index.value === null ? null : props.items[index.value]))

function close() {
  index.value = null
}

function go(step: number) {
  if (index.value === null) return
  index.value = (index.value + step + props.items.length) % props.items.length
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
  else if (e.key === 'ArrowRight') go(1)
  else if (e.key === 'ArrowLeft') go(-1)
}

watch(index, (value, prev) => {
  if (value !== null && prev === null) {
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
  } else if (value === null) {
    document.removeEventListener('keydown', onKey)
    document.body.style.overflow = ''
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
</script>

<template lang="pug">
Teleport(to='body')
  Transition(name='lightbox')
    .lightbox(v-if='current' role='dialog' aria-modal='true' :aria-label='current.title' @click.self='close')
      button.lightbox__close(type='button' aria-label='Закрити' @click='close')
        svg(width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' aria-hidden='true')
          path(d='M18 6 6 18M6 6l12 12')
      button.lightbox__nav.lightbox__nav--prev(type='button' aria-label='Попередній' @click='go(-1)')
        svg(width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true')
          path(d='m15 18-6-6 6-6')
      figure.lightbox__figure
        Transition(name='lightbox-img' mode='out-in')
          img.lightbox__img(:key='current.src' :src='current.src' :alt='current.title')
        figcaption.lightbox__caption
          b {{ current.title }}
          span {{ current.meta }}
      button.lightbox__nav.lightbox__nav--next(type='button' aria-label='Наступний' @click='go(1)')
        svg(width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true')
          path(d='m9 18 6-6-6-6')
</template>

<style lang="scss">
@use '@/scss/variables' as *;

.lightbox {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 24px;
  background: rgba(10, 26, 17, 0.82);
  backdrop-filter: blur(6px);

  &__figure {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    max-width: min(1000px, 100%);
    margin: 0;
  }

  &__img {
    display: block;
    max-width: 100%;
    max-height: 78vh;
    border-radius: 12px;
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.4);
  }

  &__caption {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #fff;
    text-align: center;

    span {
      color: $text-on-dark;
      font-size: 14px;
    }
  }

  &__close,
  &__nav {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: rgba(255, 255, 255, 0.12);
    border: none;
    border-radius: 50%;
    color: #fff;
    cursor: pointer;
    transition: background 0.25s ease, transform 0.25s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.24);
      transform: scale(1.08);
    }
  }

  &__close {
    position: absolute;
    top: 20px;
    right: 20px;
  }

  @media (max-width: $bp-md) {
    &__nav {
      position: absolute;
      bottom: 20px;
    }

    &__nav--prev {
      left: calc(50% - 60px);
    }

    &__nav--next {
      right: calc(50% - 60px);
    }

    &__img {
      max-height: 65vh;
    }
  }
}

.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.3s ease;

  .lightbox__figure {
    transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
  }
}

.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;

  .lightbox__figure {
    transform: scale(0.94);
  }
}

.lightbox-img-enter-active,
.lightbox-img-leave-active {
  transition: opacity 0.2s ease;
}

.lightbox-img-enter-from,
.lightbox-img-leave-to {
  opacity: 0;
}
</style>
