import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

import FaqSection from '../components/FaqSection.vue'

describe('FaqSection', () => {
  it('за замовчуванням усі відповіді закриті', () => {
    const w = mount(FaqSection)
    for (const q of w.findAll('.faq__q')) expect(q.attributes('aria-expanded')).toBe('false')
  })

  it('відкриває одну відповідь за раз і закриває повторним кліком', async () => {
    const w = mount(FaqSection)
    const items = () => w.findAll('.faq__item')
    const buttons = w.findAll('.faq__q')

    await buttons[0]!.trigger('click')
    expect(items()[0]!.classes()).toContain('faq__item--open')
    expect(buttons[0]!.attributes('aria-expanded')).toBe('true')

    await buttons[1]!.trigger('click')
    expect(items()[0]!.classes()).not.toContain('faq__item--open')
    expect(items()[1]!.classes()).toContain('faq__item--open')

    await buttons[1]!.trigger('click')
    expect(items()[1]!.classes()).not.toContain('faq__item--open')
  })
})
