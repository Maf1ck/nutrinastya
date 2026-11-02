// SEO-тексти сторінок. Читаються і застосунком (заголовок вкладки),
// і плагіном збірки build/seo.ts, який вшиває їх у статичний HTML кожної сторінки.
import { LEGAL_DOCS, type LegalKey } from '../content/legal'

export const SITE_NAME = 'Настя · нутриціолог'

export interface PageSeo {
  path: string
  title: string
  description: string
}

export const HOME_SEO: PageSeo = {
  path: '/',
  title: 'Нутриціолог онлайн Настя — харчування без дієт і зривів',
  description:
    'Нутриціолог Настя: онлайн-консультації, індивідуальний супровід і раціон на тиждень. Харчування без жорстких дієт — 3+ роки практики, понад 100 клієнтів. Запис у Telegram.',
}

const LEGAL_DESCRIPTIONS: Record<LegalKey, string> = {
  privacy: 'Які персональні дані обробляє нутриціолог Настя, навіщо і як їх захищено.',
  terms: 'Умови використання сайту нутриціолога Насті.',
  disclaimer: 'Нутриціолог не замінює лікаря: важливі обмеження та застереження щодо рекомендацій.',
}

export const legalSeo = (key: LegalKey): PageSeo => ({
  path: `/${key}`,
  title: `${LEGAL_DOCS[key].title} — ${SITE_NAME}`,
  description: LEGAL_DESCRIPTIONS[key],
})

export const PAGES: PageSeo[] = [HOME_SEO, ...(Object.keys(LEGAL_DOCS) as LegalKey[]).map(legalSeo)]
