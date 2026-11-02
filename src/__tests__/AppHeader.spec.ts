import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

import AppHeader from '../components/AppHeader.vue'

describe('AppHeader', () => {
  it('відкриває й закриває бургер-меню', async () => {
    const w = mount(AppHeader)
    const burger = w.find('.header__burger')

    expect(burger.attributes('aria-expanded')).toBe('false')
    await burger.trigger('click')
    expect(burger.attributes('aria-expanded')).toBe('true')
    expect(w.find('.header').classes()).toContain('header--menu-open')
    expect(document.body.style.overflow).toBe('hidden')

    await burger.trigger('click')
    expect(burger.attributes('aria-expanded')).toBe('false')
    expect(document.body.style.overflow).toBe('')
    w.unmount()
  })

  it('закриває меню після кліку по пункту та по Esc', async () => {
    const w = mount(AppHeader)
    const burger = w.find('.header__burger')

    await burger.trigger('click')
    await w.find('.mobile-menu__link').trigger('click')
    expect(burger.attributes('aria-expanded')).toBe('false')

    await burger.trigger('click')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await w.vm.$nextTick()
    expect(burger.attributes('aria-expanded')).toBe('false')
    w.unmount()
  })
})
