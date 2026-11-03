<script setup lang="ts">
import { computed, ref } from 'vue'
import { CONTACTS } from '@/config/site'

interface Level {
  /** Верхня межа балів (включно) */
  max: number
  title: string
  text: string
  tips: string[]
}

// Скорочена до 10 питань версія опитувальника з дефіциту магнію:
// «регулярно» — 2 бали, «іноді» — 1, «ніколи» — 0.
const options = [
  { text: 'Регулярно', points: 2 },
  { text: 'Іноді', points: 1 },
  { text: 'Ніколи', points: 0 },
]

const questions = [
  'Як часто ви їсте фастфуд і мало свіжих овочів та фруктів?',
  'Як часто ви п’єте багато кави (3 чашки й більше на день)?',
  'Як часто ви відчуваєте сильний стрес чи підвищене психічне навантаження?',
  'Як часто ви відчуваєте швидку втому або фізичну перевтому?',
  'Як часто вас турбують дратівливість, тривожність чи плаксивість?',
  'Як часто у вас буває безсоння або відчуття «розбитості» після сну?',
  'Як часто бувають судоми в ногах, тік біля очей чи оніміння кінцівок?',
  'Як часто ви відчуваєте серцебиття або перебої в роботі серця?',
  'Як часто вас турбують головні болі чи запаморочення?',
  'Як часто на вас діють фактори, що вимивають магній: алкоголь, сауна, сечогінні чи гормональні препарати?',
]

const MAX_SCORE = questions.length * 2

// Межі пропорційні шкалі оригіналу (0–5 / 6–15 / 16–26 / 27–37 / 38+ із 62 балів)
const levels: Level[] = [
  {
    max: 2,
    title: 'Ознак дефіциту немає',
    text: 'За вашими відповідями вчасно поповнювати магній поки не потрібно. Лишається підтримувати раціон і режим.',
    tips: [
      'Тримайте в раціоні гречку, горіхи, насіння гарбуза, зелень і бобові.',
      'Не зловживайте кавою й алкоголем — вони вимивають магній.',
      'Спіть 7–8 годин: недосип посилює втрати магнію.',
    ],
  },
  {
    max: 5,
    title: 'Зона ризику',
    text: 'Окремі ознаки вже є. Це привід придивитися до раціону й режиму, поки ситуація не загострилась.',
    tips: [
      'Додайте щодня 1–2 джерела магнію: гарбузове насіння, мигдаль, шпинат, банани, цільні крупи.',
      'Обмежте каву до 1–2 чашок і не пийте її замість їжі.',
      'Слідкуйте за сном і рівнем стресу, ведіть щоденник самопочуття.',
    ],
  },
  {
    max: 8,
    title: 'Помірний ризик дефіциту',
    text: 'Симптомів і чинників достатньо, щоб підозрювати нестачу магнію. Варто змінити харчування і розібратись із причинами.',
    tips: [
      'Складіть раціон з продуктами, багатими на магній, і їжте їх щодня, а не раз на тиждень.',
      'Зменште каву, алкоголь і фастфуд, додайте більше свіжих овочів і фруктів.',
      'Обговоріть симптоми з лікарем і нутриціологом, перш ніж приймати добавки.',
    ],
  },
  {
    max: 12,
    title: 'Ймовірний дефіцит магнію',
    text: 'Ваші відповіді типові для дефіциту магнію. Одним тестом діагноз не ставиться, але розібратися варто.',
    tips: [
      'Запишіться на консультацію: складемо раціон і перевіримо причини втрат магнію.',
      'Не призначайте собі добавки самостійно: дозу й форму підбирає лікар.',
      'Якщо є судоми, серцебиття чи оніміння, обов’язково зверніться до лікаря.',
    ],
  },
  {
    max: MAX_SCORE,
    title: 'Виражені ознаки дефіциту',
    text: 'Майже всі симптоми й чинники присутні. Не відкладайте: потрібна консультація спеціаліста.',
    tips: [
      'Зверніться до лікаря, особливо якщо турбує серце, судоми або оніміння.',
      'Разом із нутриціологом перегляньте раціон і режим: кава, алкоголь, сон, стрес.',
      'Ведіть щоденник самопочуття, він допоможе швидше знайти причину.',
    ],
  },
]

const current = ref(0)
const answers = ref<(number | null)[]>(questions.map(() => null))
const finished = ref(false)

const question = computed(() => questions[current.value]!)
const selected = computed(() => answers.value[current.value])
const percent = computed(() =>
  Math.round(((finished.value ? questions.length : current.value + 1) / questions.length) * 100),
)

const score = computed(() =>
  answers.value.reduce<number>((sum, a) => sum + (a === null ? 0 : options[a]!.points), 0),
)

const result = computed(() => levels.find((l) => score.value <= l.max)!)

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
      h2.quiz__title Чи є у вас дефіцит магнію?
      p 10 запитань про самопочуття й звички — і ви одразу отримаєте результат із порадами.
    .quiz__card
      .quiz__meta
        span(v-if='!finished') Питання {{ current + 1 }} з {{ questions.length }}
        span(v-else) Ваш результат
        span {{ percent }}%
      .quiz__bar
        span(:style='{ width: percent + "%" }')
      Transition(name='quiz-step' mode='out-in')
        .quiz__step(v-if='!finished' :key='current')
          .quiz__question {{ question }}
          button.quiz__option(
            v-for='(option, i) in options'
            :key='option.text'
            type='button'
            :class="{ 'quiz__option--active': i === selected }"
            @click='select(i)'
          ) {{ option.text }}
          .quiz__actions
            button.btn.btn--outline(type='button' :disabled='current === 0' @click='back') Назад
            button.btn.btn--primary(type='button' :disabled='selected === null' @click='next') {{ current === questions.length - 1 ? 'Показати результат' : 'Далі' }}
        .quiz__step(v-else key='result')
          .quiz__score Ваш бал: {{ score }} з {{ MAX_SCORE }}
          .quiz__result-title {{ result.title }}
          p.quiz__result-text {{ result.text }}
          ul.quiz__tips
            li(v-for='tip in result.tips' :key='tip') {{ tip }}
          p.quiz__note Тест орієнтовний і не є діагнозом. Аналіз магнію в сироватці крові малоінформативний, тож оцінюють за симптомами й раціоном.
          .quiz__actions
            button.btn.btn--outline(type='button' @click='restart') Пройти ще раз
            a.btn.btn--primary(:href='CONTACTS.telegram' target='_blank' rel='noopener') Обговорити з Анастасією
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

.quiz__score {
  color: $text-muted;
  font-size: 14px;
  font-weight: 600;
}

.quiz__note {
  color: $text-muted;
  font-size: 13px;
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
