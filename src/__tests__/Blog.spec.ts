import { describe, it, expect, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

import App from '../App.vue'
import router from '../router'
import { ARTICLE_BY_SLUG, ARTICLES, parseInline, plainText } from '../content/blog'
import { PAGES } from '../config/seo'

vi.stubGlobal('scrollTo', vi.fn<() => void>())

async function mountAt(path: string) {
  await router.push(path)
  await router.isReady()
  const wrapper = mount(App, { global: { plugins: [router] } })
  await flushPromises()
  return wrapper
}

describe('Блог', () => {
  it('має 12 статей з унікальними slug і SEO-полями', () => {
    expect(ARTICLES).toHaveLength(12)
    expect(new Set(ARTICLES.map((a) => a.slug)).size).toBe(ARTICLES.length)
    expect(new Set(ARTICLES.map((a) => a.seoTitle)).size).toBe(ARTICLES.length)
    for (const a of ARTICLES) {
      expect(a.slug, a.slug).toMatch(/^[a-z0-9-]+$/)
      expect(a.seoTitle.length, a.slug).toBeLessThanOrEqual(65)
      expect(a.description.length, a.slug).toBeLessThanOrEqual(170)
    }
  })

  it('кожна стаття потрапляє в PAGES (окремий HTML і sitemap)', () => {
    const paths = PAGES.map((p) => p.path)
    expect(paths).toContain('/blog')
    for (const a of ARTICLES) expect(paths).toContain(`/blog/${a.slug}`)
  })

  it('внутрішні посилання в статтях ведуть на існуючі сторінки', () => {
    for (const a of ARTICLES) {
      const texts = a.sections.flatMap((s) => [...(s.paragraphs ?? []), ...(s.list ?? []), s.tip ?? ''])
      for (const t of texts) {
        for (const p of parseInline(t).filter((x) => x.to)) {
          const m = p.to!.match(/^\/blog\/(.+)$/)
          if (m) expect(ARTICLE_BY_SLUG[m[1]!], `${a.slug} → ${p.to}`).toBeDefined()
          else expect(p.to, a.slug).toMatch(/^\/(#\w+)?$/)
        }
      }
    }
  })

  it('розбирає посилання в тексті', () => {
    expect(parseInline('Див. [метод тарілки](/blog/metod-tarilky) тут')).toEqual([
      { text: 'Див. ' },
      { text: 'метод тарілки', to: '/blog/metod-tarilky' },
      { text: ' тут' },
    ])
    expect(plainText('a [b](/c) d')).toBe('a b d')
  })

  it('показує всі статті на /blog і фільтрує за категорією', async () => {
    const w = await mountAt('/blog')
    expect(w.find('h1').text()).toBe('Блог нутриціолога')
    expect(w.findAll('.blog-card')).toHaveLength(12)

    const chip = w.findAll('.blog-filter__chip').find((b) => b.text() === 'Спорт')!
    await chip.trigger('click')
    expect(w.findAll('.blog-card')).toHaveLength(ARTICLES.filter((a) => a.category === 'Спорт').length)
  })

  it('відкриває статтю з заголовком і схожими статтями', async () => {
    const a = ARTICLE_BY_SLUG['nutrytsioloh-i-diietoloh-riznytsia']!
    const w = await mountAt(`/blog/${a.slug}`)
    expect(w.find('h1').text()).toBe(a.title)
    expect(w.findAll('.article__body h2')).toHaveLength(a.sections.length)
    expect(w.findAll('.article-related .blog-card')).toHaveLength(3)
    expect(document.title).toBe(a.seoTitle)
  })

  it('перенаправляє невідому статтю на список', async () => {
    await mountAt('/blog/nema-takoi')
    expect(router.currentRoute.value.name).toBe('blog')
  })

  it('на головній є секція блогу з посиланням на всі статті', async () => {
    const w = await mountAt('/')
    expect(w.find('#blog').exists()).toBe(true)
    expect(w.findAll('#blog .blog-card')).toHaveLength(3)
    expect(w.find('#blog a[href="/blog"]').exists()).toBe(true)
  })
})
