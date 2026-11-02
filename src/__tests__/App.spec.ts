import { describe, it, expect, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

import App from '../App.vue'
import router from '../router'
import { CONTACTS } from '../config/site'

// jsdom не реалізує scrollTo, який викликає scrollBehavior роутера
vi.stubGlobal('scrollTo', vi.fn<() => void>())

async function mountAt(path: string) {
  await router.push(path)
  await router.isReady()
  const wrapper = mount(App, { global: { plugins: [router] } })
  await flushPromises()
  return wrapper
}

describe('App', () => {
  it('рендерить головну сторінку з усіма секціями', async () => {
    const wrapper = await mountAt('/')
    expect(wrapper.find('h1').text()).toBe('Харчування без жорстких дієт і зривів')
    for (const id of ['about', 'services', 'quiz', 'reviews', 'contact', 'faq']) {
      expect(wrapper.find(`#${id}`).exists(), `секція #${id}`).toBe(true)
    }
  })

  it('показує всі результати клієнтів', async () => {
    const wrapper = await mountAt('/')
    expect(wrapper.findAll('.result')).toHaveLength(8)
  })

  it.each([
    ['/privacy', 'Політика конфіденційності'],
    ['/terms', 'Умови використання'],
    ['/disclaimer', 'Відмова від відповідальності'],
  ])('відкриває юридичну сторінку %s', async (path, title) => {
    const wrapper = await mountAt(path)
    expect(wrapper.find('h1').text()).toBe(title)
  })

  it('усі кнопки запису ведуть у Telegram', async () => {
    const wrapper = await mountAt('/')
    const cta = wrapper.findAll('a').filter((a) => /Записатися|Безкоштовна консультація/.test(a.text()))
    expect(cta.length).toBeGreaterThan(3)
    for (const a of cta) expect(a.attributes('href')).toBe(CONTACTS.telegram)
  })

  it('перенаправляє невідомі адреси на головну', async () => {
    await mountAt('/whatever')
    expect(router.currentRoute.value.path).toBe('/')
  })
})
