// SEO-тексти сторінок. Читаються і застосунком (заголовок вкладки),
// і плагіном збірки build/seo.ts, який вшиває їх у статичний HTML кожної сторінки.
import { LEGAL_DOCS, type LegalKey } from '../content/legal'
import { ARTICLES, ARTICLE_BY_SLUG, articlePath } from '../content/blog'

export const SITE_NAME = 'Анастасія · нутриціолог'

export interface PageSeo {
  path: string
  title: string
  description: string
  kind: 'home' | 'legal' | 'blog' | 'article'
}

export const HOME_SEO: PageSeo = {
  path: '/',
  kind: 'home',
  title: 'Нутриціолог онлайн Анастасія — харчування без дієт і зривів',
  description:
    'Нутриціолог Анастасія: онлайн-консультації, індивідуальний супровід і раціон на тиждень. Харчування без жорстких дієт — 3+ роки практики, понад 100 клієнтів. Запис у Telegram.',
}

const LEGAL_DESCRIPTIONS: Record<LegalKey, string> = {
  privacy: 'Які персональні дані обробляє нутриціолог Анастасія, навіщо і як їх захищено.',
  terms: 'Умови використання сайту нутриціолога Анастасії.',
  disclaimer: 'Нутриціолог не замінює лікаря: важливі обмеження та застереження щодо рекомендацій.',
}

export const legalSeo = (key: LegalKey): PageSeo => ({
  path: `/${key}`,
  kind: 'legal',
  title: `${LEGAL_DOCS[key].title} — ${SITE_NAME}`,
  description: LEGAL_DESCRIPTIONS[key],
})

export const BLOG_SEO: PageSeo = {
  path: '/blog',
  kind: 'blog',
  title: 'Блог нутриціолога — статті про харчування без дієт',
  description:
    'Блог нутриціолога Анастасії: хто такий нутриціолог, чим він відрізняється від дієтолога, як схуднути без зривів, норми білка, води й магнію, харчування для спорту.',
}

export const articleSeo = (slug: string): PageSeo => {
  const a = ARTICLE_BY_SLUG[slug]!
  return { path: articlePath(slug), kind: 'article', title: a.seoTitle, description: a.description }
}

export const PAGES: PageSeo[] = [
  HOME_SEO,
  BLOG_SEO,
  ...ARTICLES.map((a) => articleSeo(a.slug)),
  ...(Object.keys(LEGAL_DOCS) as LegalKey[]).map(legalSeo),
]
