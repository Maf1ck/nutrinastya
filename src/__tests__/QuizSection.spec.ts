import { describe, it, expect } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'

import QuizSection from '../components/QuizSection.vue'

const FIRST_QUESTION = 'Як часто ви їсте фастфуд і мало свіжих овочів та фруктів?'

// варіанти за порядком: 0 — «Регулярно» (2 бали), 1 — «Іноді» (1), 2 — «Ніколи» (0)
const REGULAR = 0
const SOMETIMES = 1
const NEVER = 2

const nextButton = (w: VueWrapper) => w.find('.quiz__actions .btn--primary')

async function answerAll(w: VueWrapper, pick: (question: number) => number) {
  for (let q = 0; q < 10; q++) {
    await w.findAll('.quiz__option')[pick(q)]!.trigger('click')
    await nextButton(w).trigger('click')
  }
}

describe('QuizSection', () => {
  it('показує перше питання і прогрес із 10 питань', () => {
    const w = mount(QuizSection)
    expect(w.find('.quiz__question').text()).toBe(FIRST_QUESTION)
    expect(w.find('.quiz__meta').text()).toContain('Питання 1 з 10')
    expect(w.findAll('.quiz__option').map((o) => o.text())).toEqual(['Регулярно', 'Іноді', 'Ніколи'])
  })

  it('не дає перейти далі без відповіді', async () => {
    const w = mount(QuizSection)
    expect(nextButton(w).attributes('disabled')).toBeDefined()
    await w.findAll('.quiz__option')[0]!.trigger('click')
    expect(nextButton(w).attributes('disabled')).toBeUndefined()
  })

  it('кнопка «Назад» повертає до попереднього питання і зберігає відповідь', async () => {
    const w = mount(QuizSection)
    await w.findAll('.quiz__option')[SOMETIMES]!.trigger('click')
    await nextButton(w).trigger('click')
    expect(w.find('.quiz__meta').text()).toContain('Питання 2 з 10')

    await w.find('.quiz__actions .btn--outline').trigger('click')
    expect(w.find('.quiz__meta').text()).toContain('Питання 1 з 10')
    expect(w.findAll('.quiz__option')[SOMETIMES]!.classes()).toContain('quiz__option--active')
  })

  // Бали = сума відповідей, межі рівнів: 0–2 / 3–5 / 6–8 / 9–12 / 13–20
  it.each([
    { name: 'усе «ніколи»', pick: () => NEVER, score: 0, title: 'Ознак дефіциту немає' },
    { name: 'два «іноді»', pick: (q: number) => (q < 2 ? SOMETIMES : NEVER), score: 2, title: 'Ознак дефіциту немає' },
    { name: 'три «іноді»', pick: (q: number) => (q < 3 ? SOMETIMES : NEVER), score: 3, title: 'Зона ризику' },
    { name: 'п’ять «іноді»', pick: (q: number) => (q < 5 ? SOMETIMES : NEVER), score: 5, title: 'Зона ризику' },
    { name: 'шість «іноді»', pick: (q: number) => (q < 6 ? SOMETIMES : NEVER), score: 6, title: 'Помірний ризик дефіциту' },
    { name: 'вісім «іноді»', pick: (q: number) => (q < 8 ? SOMETIMES : NEVER), score: 8, title: 'Помірний ризик дефіциту' },
    { name: 'дев’ять «іноді»', pick: (q: number) => (q < 9 ? SOMETIMES : NEVER), score: 9, title: 'Ймовірний дефіцит магнію' },
    { name: 'усе «іноді»', pick: () => SOMETIMES, score: 10, title: 'Ймовірний дефіцит магнію' },
    { name: 'шість «регулярно»', pick: (q: number) => (q < 6 ? REGULAR : NEVER), score: 12, title: 'Ймовірний дефіцит магнію' },
    { name: 'шість «регулярно» і одне «іноді»', pick: (q: number) => (q < 6 ? REGULAR : q === 6 ? SOMETIMES : NEVER), score: 13, title: 'Виражені ознаки дефіциту' },
    { name: 'усе «регулярно»', pick: () => REGULAR, score: 20, title: 'Виражені ознаки дефіциту' },
  ])('$name → $score балів, «$title»', async ({ pick, score, title }) => {
    const w = mount(QuizSection)
    await answerAll(w, pick)
    expect(w.find('.quiz__score').text()).toBe(`Ваш бал: ${score} з 20`)
    expect(w.find('.quiz__result-title').text()).toBe(title)
    expect(w.find('.quiz__meta').text()).toContain('100%')
  })

  it('на результаті є застереження і кнопка запису в Telegram', async () => {
    const w = mount(QuizSection)
    await answerAll(w, () => SOMETIMES)
    expect(w.find('.quiz__note').text()).toContain('не є діагнозом')
    expect(w.find('.quiz__actions a.btn--primary').attributes('href')).toBe('https://t.me/nk_1802')
  })

  it('дозволяє пройти тест ще раз', async () => {
    const w = mount(QuizSection)
    await answerAll(w, () => REGULAR)
    await w.find('.quiz__actions .btn--outline').trigger('click')
    expect(w.find('.quiz__question').text()).toBe(FIRST_QUESTION)
    expect(nextButton(w).attributes('disabled')).toBeDefined()
  })
})
