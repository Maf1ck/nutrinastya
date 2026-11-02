import { describe, it, expect } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'

import QuizSection from '../components/QuizSection.vue'

const nextButton = (w: VueWrapper) => w.find('.quiz__actions .btn--primary')

async function answerAll(w: VueWrapper, pick: (question: number) => number) {
  for (let q = 0; q < 7; q++) {
    await w.findAll('.quiz__option')[pick(q)]!.trigger('click')
    await nextButton(w).trigger('click')
  }
}

describe('QuizSection', () => {
  it('показує перше питання і прогрес', () => {
    const w = mount(QuizSection)
    expect(w.find('.quiz__question').text()).toBe('Як часто ви снідаєте?')
    expect(w.find('.quiz__meta').text()).toContain('Питання 1 з 7')
  })

  it('не дає перейти далі без відповіді', async () => {
    const w = mount(QuizSection)
    expect(nextButton(w).attributes('disabled')).toBeDefined()
    await w.findAll('.quiz__option')[0]!.trigger('click')
    expect(nextButton(w).attributes('disabled')).toBeUndefined()
  })

  it('кнопка «Назад» повертає до попереднього питання і зберігає відповідь', async () => {
    const w = mount(QuizSection)
    await w.findAll('.quiz__option')[1]!.trigger('click')
    await nextButton(w).trigger('click')
    expect(w.find('.quiz__meta').text()).toContain('Питання 2 з 7')

    await w.find('.quiz__actions .btn--outline').trigger('click')
    expect(w.find('.quiz__meta').text()).toContain('Питання 1 з 7')
    expect(w.findAll('.quiz__option')[1]!.classes()).toContain('quiz__option--active')
  })

  it('рахує збалансований тип', async () => {
    const w = mount(QuizSection)
    await answerAll(w, () => 0)
    expect(w.find('.quiz__result-title').text()).toBe('Збалансований тип')
    expect(w.find('.quiz__meta').text()).toContain('100%')
  })

  it('рахує емоційний тип', async () => {
    const w = mount(QuizSection)
    await answerAll(w, () => 2)
    expect(w.find('.quiz__result-title').text()).toBe('Емоційний тип')
  })

  it('рахує тип «на бігу»', async () => {
    const w = mount(QuizSection)
    await answerAll(w, () => 1)
    expect(w.find('.quiz__result-title').text()).toBe('Тип «на бігу»')
  })

  it('дозволяє пройти тест ще раз', async () => {
    const w = mount(QuizSection)
    await answerAll(w, () => 0)
    await w.find('.quiz__actions .btn--outline').trigger('click')
    expect(w.find('.quiz__question').text()).toBe('Як часто ви снідаєте?')
    expect(nextButton(w).attributes('disabled')).toBeDefined()
  })
})
