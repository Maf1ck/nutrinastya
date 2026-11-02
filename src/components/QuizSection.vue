<script setup lang="ts">
import { computed, ref } from 'vue'
import { CONTACTS } from '@/config/site'

type HabitType = 'balanced' | 'rushed' | 'emotional'

interface Question {
  text: string
  options: { text: string; type: HabitType }[]
}

interface Result {
  title: string
  text: string
  tips: string[]
}

const questions: Question[] = [
  {
    text: 'Як часто ви снідаєте?',
    options: [
      { text: 'Щодня', type: 'balanced' },
      { text: 'Іноді, коли встигаю', type: 'rushed' },
      { text: 'Майже ніколи', type: 'rushed' },
    ],
  },
  {
    text: 'Як зазвичай проходить ваш обід?',
    options: [
      { text: 'Приблизно в один і той самий час', type: 'balanced' },
      { text: 'Коли з’являється вільна хвилина', type: 'rushed' },
      { text: 'Коли нудно або хочеться відволіктись', type: 'emotional' },
    ],
  },
  {
    text: 'Що ви робите, коли відчуваєте стрес?',
    options: [
      { text: 'Йду на прогулянку чи розминку', type: 'balanced' },
      { text: 'Забуваю поїсти до самого вечора', type: 'rushed' },
      { text: 'Тягне на солодке чи щось смачне', type: 'emotional' },
    ],
  },
  {
    text: 'Які у вас перекуси?',
    options: [
      { text: 'Фрукти, горіхи, йогурт', type: 'balanced' },
      { text: 'Те, що під рукою: кава, булочка, батончик', type: 'rushed' },
      { text: 'Солодощі чи фастфуд «для настрою»', type: 'emotional' },
    ],
  },
  {
    text: 'Яка у вас вечеря?',
    options: [
      { text: 'Легка, за кілька годин до сну', type: 'balanced' },
      { text: 'Пізня й щільна — бо весь день не було часу', type: 'rushed' },
      { text: 'Велика, як нагорода за важкий день', type: 'emotional' },
    ],
  },
  {
    text: 'Скільки води ви п’єте протягом дня?',
    options: [
      { text: 'Близько 1,5–2 літрів', type: 'balanced' },
      { text: 'Переважно каву та чай', type: 'rushed' },
      { text: 'Іноді плутаю спрагу з бажанням щось з’їсти', type: 'emotional' },
    ],
  },
  {
    text: 'Як ви почуваєтесь після їжі?',
    options: [
      { text: 'Легко й з енергією', type: 'balanced' },
      { text: 'Втомленою та сонною', type: 'rushed' },
      { text: 'З відчуттям провини', type: 'emotional' },
    ],
  },
]

const results: Record<HabitType, Result> = {
  balanced: {
    title: 'Збалансований тип',
    text: 'У вас уже є стабільний режим і спокійні стосунки з їжею. Лишилось відточити деталі та закріпити звички.',
    tips: [
      'Додайте більше різноманіття в раціон: нові крупи, овочі, джерела білка.',
      'Слідкуйте за якістю сну — він напряму впливає на апетит.',
      'Раз на місяць переглядайте раціон, щоб він відповідав вашим цілям.',
    ],
  },
  rushed: {
    title: 'Тип «на бігу»',
    text: 'Їжа у вас залежить від графіка: пропущені прийоми, кава замість обіду і щільна пізня вечеря.',
    tips: [
      'Плануйте 3 основні прийоми їжі в календарі так само, як зустрічі.',
      'Тримайте під рукою готові перекуси: горіхи, фрукти, йогурт.',
      'Готуйте частину страв наперед на 2–3 дні.',
    ],
  },
  emotional: {
    title: 'Емоційний тип',
    text: 'Їжа для вас часто спосіб заспокоїтись або відволіктись. Це можна м’яко змінити без заборон і жорстких дієт.',
    tips: [
      'Перед перекусом запитайте себе: це голод чи емоція?',
      'Знайдіть 2–3 альтернативні способи розрядки: прогулянка, душ, розмова.',
      'Не забороняйте улюблене — їжте його свідомо й без провини.',
    ],
  },
}

const current = ref(0)
const answers = ref<(number | null)[]>(questions.map(() => null))
const finished = ref(false)

const question = computed(() => questions[current.value]!)
const selected = computed(() => answers.value[current.value])
const percent = computed(() =>
  Math.round(((finished.value ? questions.length : current.value + 1) / questions.length) * 100),
)

const result = computed(() => {
  const score: Record<HabitType, number> = { balanced: 0, rushed: 0, emotional: 0 }
  answers.value.forEach((a, i) => {
    if (a !== null) score[questions[i]!.options[a]!.type]++
  })
  const top = (Object.keys(score) as HabitType[]).reduce((a, b) => (score[b] > score[a] ? b : a))
  return results[top]
})

function select(index: number) {
  answers.value[current.value] = index
}

function next() {
  if (selected.value === null) return
  if (current.value === questions.length - 1) finished.value = true
  else current.value++
}

function back() {
  if (current.value > 0) current.value--
}

function restart() {
  answers.value = questions.map(() => null)
  current.value = 0
  finished.value = false
}
</script>

<template lang="pug">
section#quiz.container
  .quiz(v-reveal='0')
    .quiz__info
      .eyebrow Тест за 2 хвилини
      h2.quiz__title Який у вас тип харчових звичок?
      p 7 простих питань — і ви одразу отримаєте результат з персональними порадами.
    .quiz__card
      .quiz__meta
        span(v-if='!finished') Питання {{ current + 1 }} з {{ questions.length }}
        span(v-else) Ваш результат
        span {{ percent }}%
      .quiz__bar
        span(:style='{ width: percent + "%" }')
      Transition(name='quiz-step' mode='out-in')
        .quiz__step(v-if='!finished' :key='current')
          .quiz__question {{ question.text }}
          button.quiz__option(
            v-for='(option, i) in question.options'
            :key='option.text'
            type='button'
            :class="{ 'quiz__option--active': i === selected }"
            @click='select(i)'
          ) {{ option.text }}
          .quiz__actions
            button.btn.btn--outline(type='button' :disabled='current === 0' @click='back') Назад
            button.btn.btn--primary(type='button' :disabled='selected === null' @click='next') {{ current === questions.length - 1 ? 'Показати результат' : 'Далі' }}
        .quiz__step(v-else key='result')
          .quiz__result-title {{ result.title }}
          p.quiz__result-text {{ result.text }}
          ul.quiz__tips
            li(v-for='tip in result.tips' :key='tip') {{ tip }}
          .quiz__actions
            button.btn.btn--outline(type='button' @click='restart') Пройти ще раз
            a.btn.btn--primary(:href='CONTACTS.telegram' target='_blank' rel='noopener') Обговорити з Настею
</template>

<style lang="scss">
@use '@/scss/variables' as *;

.quiz__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 6px;

  .btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
}

.quiz__result-title {
  font-family: $font-heading;
  font-size: 26px;
  font-weight: 600;
}

.quiz__result-text {
  color: $text-muted;
}

.quiz__tips {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding-left: 20px;
  color: $text-nav;
}

.quiz {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 40px;
  padding: 48px;
  background: $bg-tint;
  border-radius: 32px;

  @media (max-width: $bp-md) {
    padding: 28px 20px;
  }

  &__info {
    display: flex;
    flex: 1 1 340px;
    flex-direction: column;
    gap: 14px;
    min-width: 0;
    color: $text-nav;

    .eyebrow {
      margin: 0;
    }
  }

  &__title {
    color: $text;
    font-size: 38px;
    line-height: 1.2;

    @media (max-width: $bp-md) {
      font-size: 30px;
    }
  }

  &__card {
    display: flex;
    flex: 1 1 380px;
    flex-direction: column;
    gap: 14px;
    min-width: 0;
    padding: 28px;
    background: $bg;
    border-radius: 24px;
  }

  &__meta {
    display: flex;
    justify-content: space-between;
    color: $text-muted;
    font-size: 14px;
  }

  &__bar {
    height: 6px;
    background: $line;
    border-radius: 3px;

    span {
      display: block;
      height: 100%;
      background: $accent;
      border-radius: 3px;
    }
  }

  &__question {
    font-size: 18px;
    font-weight: 700;
  }

  &__option {
    min-height: 48px;
    padding: 14px 16px;
    background: $bg;
    border: 1px solid $line-green;
    border-radius: 14px;
    color: $text;
    font: inherit;
    text-align: left;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;

    &:hover {
      border-color: $accent;
    }

    &--active {
      padding: 13px 15px;
      background: $bg-selected;
      border: 2px solid $accent;
      font-weight: 600;
    }
  }
}
.quiz__step {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.quiz__bar span {
  transition: width 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}

.quiz-step-enter-active,
.quiz-step-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.quiz-step-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.quiz-step-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
