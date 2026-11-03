import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Plugin } from 'vite'
import { CONTACTS, OWNER } from '../src/config/site'
import { BLOG_SEO, HOME_SEO, PAGES, SITE_NAME, type PageSeo } from '../src/config/seo'
import { FAQ, SERVICES } from '../src/content/home'
import {
  ARTICLE_BY_SLUG,
  ARTICLES_SORTED,
  BLOG_LEAD,
  articlePath,
  formatDate,
  parseInline,
  plainText,
  readingMinutes,
  type Article,
} from '../src/content/blog'

/**
 * SEO під час збірки.
 *
 * SPA віддає порожній <div id="app">, а соцмережі (Telegram, Instagram, Viber)
 * JS не виконують — бачать лише статичний <head>. Тому для кожної сторінки
 * пишемо окремий dist/<path>/index.html з власними title/description/OG,
 * а також sitemap.xml і robots.txt з абсолютним доменом.
 *
 * Для блогу текст статей додатково вшивається в <div id="app">, щоб пошуковики
 * бачили контент без виконання JS. Vue під час mount просто замінює цю розмітку.
 *
 * Домен: SITE_URL → домен продакшену, який Vercel передає під час збірки → запасний.
 */
const SITE_URL = (
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'https://nutrinastya.vercel.app')
).replace(/\/+$/, '')

const OG_IMAGE = `${SITE_URL}/og-image.jpg`

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const url = (path: string) => SITE_URL + (path === '/' ? '/' : path)

// ---------- JSON-LD ----------

const ldScript = (graph: object[]) =>
  // "</" усередині JSON закрив би тег <script>
  `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/<\//g, '<\\/')}</script>`

const PERSON_ID = `${SITE_URL}/#person`
const WEBSITE_ID = `${SITE_URL}/#website`
const BLOG_ID = `${url(BLOG_SEO.path)}#blog`

const breadcrumbs = (items: { name: string; path: string }[]) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: url(it.path) })),
})

function homeLd(): string {
  const person = {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: OWNER.name,
    alternateName: 'Анастасія',
    jobTitle: 'Нутриціолог',
    url: url('/'),
    image: `${SITE_URL}/hero.jpg`,
    sameAs: [CONTACTS.instagram, CONTACTS.telegram],
    knowsAbout: ['Нутриціологія', 'Спортивна нутриціологія', 'Харчування при аутоімунних захворюваннях'],
  }
  const service = {
    '@type': 'ProfessionalService',
    '@id': `${SITE_URL}/#service`,
    name: SITE_NAME,
    description: HOME_SEO.description,
    url: url('/'),
    image: OG_IMAGE,
    provider: { '@id': person['@id'] },
    areaServed: 'UA',
    availableLanguage: 'uk',
    priceRange: '400–3000 UAH',
    sameAs: [CONTACTS.instagram, CONTACTS.telegram],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Послуги нутриціолога',
      itemListElement: SERVICES.map((s) => ({
        '@type': 'Offer',
        price: s.price,
        priceCurrency: 'UAH',
        itemOffered: { '@type': 'Service', name: s.title, description: s.text },
      })),
    },
  }
  const faq = {
    '@type': 'FAQPage',
    mainEntity: FAQ.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }
  const website = { '@type': 'WebSite', '@id': WEBSITE_ID, name: SITE_NAME, url: url('/'), inLanguage: 'uk' }

  return ldScript([website, person, service, faq])
}

function blogLd(): string {
  return ldScript([
    {
      '@type': 'Blog',
      '@id': BLOG_ID,
      name: 'Блог нутриціолога Анастасії',
      description: BLOG_SEO.description,
      url: url(BLOG_SEO.path),
      inLanguage: 'uk',
      author: { '@type': 'Person', '@id': PERSON_ID, name: OWNER.name },
      isPartOf: { '@type': 'WebSite', '@id': WEBSITE_ID, name: SITE_NAME, url: url('/') },
      blogPost: ARTICLES_SORTED.map((a) => ({
        '@type': 'BlogPosting',
        headline: a.title,
        url: url(articlePath(a.slug)),
        datePublished: a.published,
      })),
    },
    breadcrumbs([
      { name: 'Головна', path: '/' },
      { name: 'Блог', path: BLOG_SEO.path },
    ]),
  ])
}

function articleLd(a: Article): string {
  const u = url(articlePath(a.slug))
  const author = { '@type': 'Person', '@id': PERSON_ID, name: OWNER.name, jobTitle: 'Нутриціолог', url: url('/') }
  return ldScript([
    {
      '@type': 'BlogPosting',
      '@id': `${u}#article`,
      headline: a.title,
      description: a.description,
      url: u,
      mainEntityOfPage: { '@type': 'WebPage', '@id': u },
      image: OG_IMAGE,
      datePublished: a.published,
      dateModified: a.updated ?? a.published,
      inLanguage: 'uk',
      articleSection: a.category,
      timeRequired: `PT${readingMinutes(a)}M`,
      author,
      publisher: author,
      isPartOf: { '@type': 'Blog', '@id': BLOG_ID },
    },
    ...(a.faq?.length
      ? [
          {
            '@type': 'FAQPage',
            '@id': `${u}#faq`,
            mainEntity: a.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
          },
        ]
      : []),
    breadcrumbs([
      { name: 'Головна', path: '/' },
      { name: 'Блог', path: BLOG_SEO.path },
      { name: a.title, path: articlePath(a.slug) },
    ]),
  ])
}

const articleOf = (page: PageSeo) => (page.kind === 'article' ? ARTICLE_BY_SLUG[page.path.split('/').pop()!] : undefined)

function pageLd(page: PageSeo): string[] {
  if (page.kind === 'home') return [homeLd()]
  if (page.kind === 'blog') return [blogLd()]
  const a = articleOf(page)
  return a ? [articleLd(a)] : []
}

// ---------- статична розмітка блогу (для пошуковиків, до запуску JS) ----------

const inline = (text: string) =>
  parseInline(text)
    .map((p) => (p.to ? `<a href="${esc(p.to)}">${esc(p.text)}</a>` : esc(p.text)))
    .join('')

const card = (a: Article) =>
  `<article class="blog-card"><a class="blog-card__link" href="${articlePath(a.slug)}">` +
  `<span class="blog-card__cat">${esc(a.category)}</span>` +
  `<h2 class="blog-card__title">${esc(a.title)}</h2>` +
  `<p class="blog-card__excerpt">${esc(a.excerpt)}</p>` +
  `<span class="blog-card__meta">${readingMinutes(a)} хв читання</span></a></article>`

const staticHeader =
  `<header class="page-header"><div class="page-header__inner">` +
  `<a class="page-header__logo" href="/">Анастасія · нутриціолог</a>` +
  `<nav class="page-header__nav"><a href="/">Головна</a><a href="/blog">Блог</a></nav>` +
  `</div></header>`

function blogBody(): string {
  return (
    staticHeader +
    `<main class="container blog-page"><div class="blog-page__intro">` +
    `<h1 class="blog-page__title">Блог нутриціолога</h1>` +
    `<p class="blog-page__lead">${esc(BLOG_LEAD)}</p></div>` +
    `<div class="blog-grid">${ARTICLES_SORTED.map(card).join('')}</div></main>`
  )
}

function articleBody(a: Article): string {
  const sections = a.sections
    .map(
      (s) =>
        `<h2>${esc(s.heading)}</h2>` +
        (s.paragraphs ?? []).map((p) => `<p>${inline(p)}</p>`).join('') +
        (s.list ? `<ul>${s.list.map((li) => `<li>${inline(li)}</li>`).join('')}</ul>` : '') +
        (s.tip ? `<p class="article__tip">${inline(s.tip)}</p>` : ''),
    )
    .join('')
  return (
    staticHeader +
    `<main class="container article">` +
    `<nav class="breadcrumbs" aria-label="Навігаційний ланцюжок"><a href="/">Головна</a> / <a href="/blog">Блог</a></nav>` +
    `<h1 class="article__title">${esc(a.title)}</h1>` +
    `<p class="article__meta">${esc(a.category)} · ${formatDate(a.published)} · ${readingMinutes(a)} хв читання · ${esc(OWNER.name)}</p>` +
    `<p class="article__lead">${esc(a.lead)}</p>` +
    `<ul class="article__takeaways">${a.takeaways.map((t) => `<li>${esc(plainText(t))}</li>`).join('')}</ul>` +
    `<div class="article__body">${sections}</div>` +
    (a.faq?.length
      ? `<section class="article-faq"><h2 class="article-faq__title">Часті питання</h2>${a.faq
          .map((f) => `<details class="article-faq__item"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`)
          .join('')}</section>`
      : '') +
    `<p>Читайте також: ${ARTICLES_SORTED.filter((x) => x.slug !== a.slug)
      .map((x) => `<a href="${articlePath(x.slug)}">${esc(x.title)}</a>`)
      .join(', ')}</p>` +
    `</main>`
  )
}

function pageBody(page: PageSeo): string {
  if (page.kind === 'blog') return blogBody()
  const a = articleOf(page)
  return a ? articleBody(a) : ''
}

// ---------- <head> ----------

function head(page: PageSeo): string {
  const t = esc(page.title)
  const d = esc(page.description)
  const u = url(page.path)
  const a = articleOf(page)
  return [
    `<title>${t}</title>`,
    `<meta name="description" content="${d}">`,
    `<meta name="robots" content="index, follow, max-image-preview:large">`,
    `<link rel="canonical" href="${u}">`,
    `<meta property="og:type" content="${a ? 'article' : 'website'}">`,
    ...(a
      ? [
          `<meta property="article:published_time" content="${a.published}">`,
          `<meta property="article:modified_time" content="${a.updated ?? a.published}">`,
          `<meta property="article:section" content="${esc(a.category)}">`,
          `<meta name="author" content="${esc(OWNER.name)}">`,
        ]
      : []),
    `<meta property="og:locale" content="uk_UA">`,
    `<meta property="og:site_name" content="${esc(SITE_NAME)}">`,
    `<meta property="og:title" content="${t}">`,
    `<meta property="og:description" content="${d}">`,
    `<meta property="og:url" content="${u}">`,
    `<meta property="og:image" content="${OG_IMAGE}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:image:alt" content="${esc(SITE_NAME)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${t}">`,
    `<meta name="twitter:description" content="${d}">`,
    `<meta name="twitter:image" content="${OG_IMAGE}">`,
    ...pageLd(page),
  ].join('\n    ')
}

const PRIORITY: Record<PageSeo['kind'], string> = { home: '1.0', blog: '0.8', article: '0.7', legal: '0.3' }

function sitemap(): string {
  const today = new Date().toISOString().slice(0, 10)
  const entries = PAGES.map((p) => {
    const a = articleOf(p)
    const lastmod = a ? (a.updated ?? a.published) : today
    return `  <url>\n    <loc>${url(p.path)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <priority>${PRIORITY[p.kind]}</priority>\n  </url>`
  })
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`
}

const MARKER = '<!--seo-->'
const APP_ROOT = '<div id="app"></div>'

export function seo(): Plugin {
  let outDir = 'dist'

  return {
    name: 'nutrinastya-seo',
    configResolved(config) {
      outDir = join(config.root, config.build.outDir)
    },
    // dev-сервер і базовий index.html отримують теги головної
    transformIndexHtml: {
      order: 'post',
      handler: (html) => html.replace(MARKER, head(HOME_SEO)),
    },
    // після запису бандла index.html вже містить хешовані assets — копіюємо його під кожну сторінку
    writeBundle() {
      const shell = readFileSync(join(outDir, 'index.html'), 'utf8')
      const homeHead = head(HOME_SEO)
      if (!shell.includes(homeHead)) this.error('index.html не містить SEO-тегів головної (<!--seo-->)')
      if (!shell.includes(APP_ROOT)) this.error(`index.html не містить ${APP_ROOT}`)

      for (const page of PAGES) {
        if (page.path === '/') continue
        const dir = join(outDir, page.path)
        mkdirSync(dir, { recursive: true })
        const html = shell.replace(homeHead, head(page)).replace(APP_ROOT, `<div id="app">${pageBody(page)}</div>`)
        writeFileSync(join(dir, 'index.html'), html)
      }

      writeFileSync(join(outDir, 'sitemap.xml'), sitemap())
      writeFileSync(
        join(outDir, 'robots.txt'),
        `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
      )
    },
  }
}
