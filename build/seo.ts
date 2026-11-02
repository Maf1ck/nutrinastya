import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Plugin } from 'vite'
import { CONTACTS, OWNER } from '../src/config/site'
import { HOME_SEO, PAGES, SITE_NAME, type PageSeo } from '../src/config/seo'
import { FAQ, SERVICES } from '../src/content/home'

/**
 * SEO під час збірки.
 *
 * SPA віддає порожній <div id="app">, а соцмережі (Telegram, Instagram, Viber)
 * JS не виконують — бачать лише статичний <head>. Тому для кожної сторінки
 * пишемо окремий dist/<path>/index.html з власними title/description/OG,
 * а також sitemap.xml і robots.txt з абсолютним доменом.
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

function jsonLd(): string {
  const person = {
    '@type': 'Person',
    '@id': `${SITE_URL}/#person`,
    name: OWNER.name,
    alternateName: 'Настя',
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
  const website = { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, name: SITE_NAME, url: url('/'), inLanguage: 'uk' }

  const data = { '@context': 'https://schema.org', '@graph': [website, person, service, faq] }
  // "</" усередині JSON закрив би тег <script>
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/<\//g, '<\\/')}</script>`
}

function head(page: PageSeo): string {
  const t = esc(page.title)
  const d = esc(page.description)
  const u = url(page.path)
  return [
    `<title>${t}</title>`,
    `<meta name="description" content="${d}">`,
    `<meta name="robots" content="index, follow, max-image-preview:large">`,
    `<link rel="canonical" href="${u}">`,
    `<meta property="og:type" content="website">`,
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
    ...(page.path === '/' ? [jsonLd()] : []),
  ].join('\n    ')
}

function sitemap(): string {
  const today = new Date().toISOString().slice(0, 10)
  const entries = PAGES.map(
    (p) =>
      `  <url>\n    <loc>${url(p.path)}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${p.path === '/' ? '1.0' : '0.3'}</priority>\n  </url>`,
  )
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`
}

const MARKER = '<!--seo-->'

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

      for (const page of PAGES) {
        if (page.path === '/') continue
        const dir = join(outDir, page.path)
        mkdirSync(dir, { recursive: true })
        if (!shell.includes(homeHead)) this.error('index.html не містить SEO-тегів головної (<!--seo-->)')
        writeFileSync(join(dir, 'index.html'), shell.replace(homeHead, head(page)))
      }

      writeFileSync(join(outDir, 'sitemap.xml'), sitemap())
      writeFileSync(
        join(outDir, 'robots.txt'),
        `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
      )
    },
  }
}
