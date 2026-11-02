<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import ResultCard, { type ClientResult } from './ResultCard.vue'
import ImageLightbox, { type LightboxItem } from './ImageLightbox.vue'

const shot = (file: string) => `${import.meta.env.BASE_URL}reviews/${file}`

const results: ClientResult[] = [
  {
    name: 'Ніна',
    period: 'за 2 місяці',
    metrics: ['−10 кг', '−10 см талія', '−9 см груди'],
    request: 'Налагодити харчування на все життя і звичайно схуднути',
    quote: 'Дякую тобі велике за наставництво ❤️ Це харчування прямо в кайф))',
    screenshot: shot('nina.png'),
  },
  {
    name: 'Олеся',
    period: 'за 22 дні',
    metrics: ['−3,7 кг', '−7 см талія', '−5 см таз'],
    request: 'Дуже хочу навчитися правильно харчуватися і бонусом схуднути',
    note: 'За 3 місяці −5 кг, і вага тримається.',
    quote: 'Я чесно дуже приємно здивована) …І це при тому, що я стала більше їсти))',
    screenshot: shot('olesia.png'),
  },
  {
    name: 'Єлизавета',
    period: 'за 1 місяць',
    metrics: ['−5 кг', '−6 см талія'],
    request: 'Зменшення ваги, покращення стану здоров’я, чиста шкіра, більше енергії',
    quote: 'Мені дуже сподобалось питатись по меню, що ти прописала. Було смачно і зручно',
    screenshot: shot('yelyzaveta.png'),
  },
  {
    name: 'Карина',
    period: 'за 1 місяць',
    metrics: ['−5 кг', '−8 см талія'],
    request: 'Навчитися контролювати харчування на постійній основі',
    quote: 'Я вообще не думала, шо в мене шось вийде… ваше подружжя це взагалі скарб для мене 🥹❤️',
    screenshot: shot('karyna.png'),
  },
  {
    name: 'Катерина',
    period: 'за 1 місяць',
    metrics: ['−2 кг', '−4 см талія'],
    request: 'Це напевно більше від мене буде залежить все) Тому сподіваюсь я впораюсь',
    quote: 'Результат такий за пару місяців — це просто ВАУ ✨ Рецепти дуже смачні на ті продукти, що їм.',
    screenshot: shot('kateryna.png'),
  },
  {
    name: 'Олександра',
    period: 'за 1 місяць',
    metrics: ['−4 кг', '−7 см талія'],
    request: 'Правильне харчування та налагодження здоров’я',
    quote: 'Знаю) сама удивляюсь. Но мне нравится. Легче желудку',
    screenshot: shot('oleksandra.png'),
  },
  {
    name: 'Костянтин',
    period: 'за 1 місяць',
    metrics: ['+2 кг'],
    request: 'Набір м’язової маси',
    note: 'Фізіологічно оптимальний темп набору «чистої» ваги без зайвого жиру.',
    quote: 'Нарешті почав нормально харчуватися, відразу помітно по організму, що стало набагато краще',
    screenshot: shot('kostiantyn.png'),
  },
  {
    name: 'Єлизавета',
    period: 'за 3 тижні',
    metrics: ['−3 кг', '−8 см талія', '−6 см таз'],
    request: 'Покращення харчування',
    note: 'Мета — −3 кг за 3 тижні, бо клієнтка готувалася до змагань.',
    screenshot: shot('yelyzaveta-2.png'),
  },
]

const screenshots = computed<LightboxItem[]>(() =>
  results.map((r) => ({ title: `Результат: ${r.name}`, meta: `${r.period} · ${r.metrics.join(', ')}`, src: r.screenshot })),
)
const active = ref<number | null>(null)

// ---------- карусель ----------
const track = ref<HTMLElement | null>(null)
const atStart = ref(true)
const atEnd = ref(false)

const current = ref(0)

function slideStep(el: HTMLElement) {
  const card = el.querySelector<HTMLElement>('.results__slide')
  return card ? card.offsetWidth + 20 : el.clientWidth
}

function updateEdges() {
  const el = track.value
  if (!el) return
  atStart.value = el.scrollLeft <= 4
  atEnd.value = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4
  current.value = atEnd.value ? results.length - 1 : Math.round(el.scrollLeft / slideStep(el))
}

function scroll(direction: 1 | -1) {
  const el = track.value
  if (!el) return
  el.scrollBy({ left: direction * slideStep(el), behavior: 'smooth' })
}

function goTo(index: number) {
  const el = track.value
  if (!el) return
  el.scrollTo({ left: index * slideStep(el), behavior: 'smooth' })
}

onMounted(() => {
  updateEdges()
  window.addEventListener('resize', updateEdges)
})
onBeforeUnmount(() => window.removeEventListener('resize', updateEdges))
</script>

<template lang="pug">
section#reviews
  .container
    .eyebrow(v-reveal='0') Відгуки
    h2.section-title(v-reveal='100') Результати клієнтів

    .results__viewport(v-reveal='200')
      button.results__arrow.results__arrow--prev(type='button' aria-label='Попередні' :disabled='atStart' @click='scroll(-1)')
        svg(width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true')
          path(d='m15 18-6-6 6-6')

      .results__track(ref='track' @scroll.passive='updateEdges')
        .results__slide(v-for='(r, i) in results' :key='r.screenshot')
          ResultCard(:result='r' @open='active = i')

      button.results__arrow.results__arrow--next(type='button' aria-label='Наступні' :disabled='atEnd' @click='scroll(1)')
        svg(width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true')
          path(d='m9 18 6-6-6-6')

    .results__dots
      button.results__dot(
        v-for='(r, i) in results'
        :key='r.screenshot'
        type='button'
        :class="{ 'results__dot--active': i === current }"
        :aria-label="'Відгук ' + (i + 1)"
        @click='goTo(i)'
      )

    p.results__disclaimer Результати індивідуальні й залежать від стану здоров’я, способу життя та виконання рекомендацій.

  ImageLightbox(v-model='active' :items='screenshots')
</template>

<style lang="scss">
@use '@/scss/variables' as *;

.results {
  &__viewport {
    position: relative;
  }

  // стрілки по боках каруселі, по центру висоти карток
  &__arrow {
    position: absolute;
    top: calc(50% - 12px);
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    background: $bg;
    border: 1px solid $line-input;
    border-radius: 50%;
    box-shadow: 0 8px 24px rgba($green-dark, 0.12);
    color: $text;
    cursor: pointer;
    transform: translateY(-50%);
    transition:
      background 0.25s ease,
      color 0.25s ease,
      border-color 0.25s ease,
      opacity 0.3s ease,
      transform 0.3s ease;

    &--prev {
      left: -26px;
    }

    &--next {
      right: -26px;
    }

    &:hover:not(:disabled) {
      background: $accent;
      border-color: $accent;
      color: #fff;
      transform: translateY(-50%) scale(1.08);
    }

    &:disabled {
      opacity: 0;
      pointer-events: none;
      transform: translateY(-50%) scale(0.8);
    }

    @media (max-width: 1300px) {
      &--prev {
        left: -12px;
      }

      &--next {
        right: -12px;
      }
    }

    // на телефоні гортаємо свайпом і крапками
    @media (max-width: 640px) {
      display: none;
    }
  }

  &__track {
    display: flex;
    gap: 20px;
    padding: 4px 0 24px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  &__slide {
    flex: 0 0 calc((100% - 40px) / 3);
    scroll-snap-align: start;

    @media (max-width: 1024px) {
      flex-basis: calc((100% - 20px) / 2);
    }

    @media (max-width: 640px) {
      flex-basis: 86%;
    }
  }

  &__dots {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
    margin-top: 4px;
  }

  &__dot {
    position: relative;
    width: 8px;
    height: 8px;
    padding: 0;
    background: $line-input;
    border: none;
    border-radius: $pill;
    cursor: pointer;
    transition: width 0.35s cubic-bezier(0.22, 1, 0.36, 1), background 0.3s ease;

    // більша зона натискання на телефоні
    &::before {
      content: '';
      position: absolute;
      inset: -10px -4px;
    }

    &--active {
      width: 26px;
      background: $accent;
    }
  }

  &__disclaimer {
    margin-top: 20px;
    text-align: center;
    color: $text-muted;
    font-size: 13px;
  }
}
</style>
