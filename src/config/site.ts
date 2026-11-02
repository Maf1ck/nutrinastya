// Контакти та юридичні дані — в одному місці, щоб міняти без пошуку по компонентах

export const CONTACTS = {
  telegram: 'https://t.me/nk_1802',
  telegramHandle: '@nk_1802',
  instagram: 'https://www.instagram.com/nk.nutrition_/',
  instagramHandle: '@nk.nutrition_',
}

export const OWNER = {
  name: 'Костенко Анастасія',
}

export const DEVELOPER = {
  telegram: 'https://t.me/zxcmaf1ck',
  telegramHandle: '@zxcmaf1ck',
}

export const LEGAL_LINKS = [
  { to: '/privacy', label: 'Політика конфіденційності' },
  { to: '/terms', label: 'Умови використання' },
  { to: '/disclaimer', label: 'Відмова від відповідальності' },
] as const
