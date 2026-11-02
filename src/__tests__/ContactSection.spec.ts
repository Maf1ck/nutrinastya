import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

import ContactSection from '../components/ContactSection.vue'
import { CONTACTS } from '../config/site'

describe('ContactSection', () => {
  it('веде на Telegram і не має форми', () => {
    const w = mount(ContactSection)
    expect(w.find('form').exists()).toBe(false)

    const cta = w.find('.contact__cta')
    expect(cta.attributes('href')).toBe(CONTACTS.telegram)
    expect(cta.attributes('target')).toBe('_blank')
    expect(cta.attributes('rel')).toContain('noopener')
  })

  it('має запасне посилання на Instagram', () => {
    const w = mount(ContactSection)
    expect(w.find('.contact__alt').attributes('href')).toBe(CONTACTS.instagram)
  })
})
