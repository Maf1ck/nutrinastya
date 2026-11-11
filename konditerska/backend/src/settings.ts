import { db } from './db.ts'

/** Editable site texts. Keys are exposed to the frontend and the admin panel. */
export const SETTING_DEFAULTS = {
  brandName: '[НАЗВА]',
  brandTagline: 'торти та десерти',
  city: '[Місто]',
  phone: '[ТЕЛЕФОН]',
  instagram: '[@акаунт]',
  infoBarText: 'Натуральні інгредієнти',
  heroEyebrow: 'Кондитерська',
  heroTitle: 'Смачні десерти для кожної події',
  heroText:
    'Торти, еклери та десерти з натуральних інгредієнтів. Обирайте на сайті — забирайте свіжими або замовляйте заморожені.',
  footerAbout: 'Кондитерська: торти, десерти та випічка на замовлення.',
  infoCard1Title: 'Самовивіз з {N} адрес',
  infoCard1Text: 'Оберіть зручну точку в {city} під час оформлення замовлення.',
  infoCard2Title: 'Натуральні інгредієнти',
  infoCard2Text: 'Готуємо зі свіжих продуктів без зайвих добавок.',
  infoCard3Title: 'Оплата при отриманні',
  infoCard3Text: 'Розраховуєтесь під час отримання замовлення. Про готовність повідомимо телефоном.',
  orderNote: 'Ми зателефонуємо, щойно замовлення буде готове.',
} as const

export type SettingKey = keyof typeof SETTING_DEFAULTS
export type Settings = Record<SettingKey, string>

export const SETTING_KEYS = Object.keys(SETTING_DEFAULTS) as SettingKey[]

export function getSettings(): Settings {
  const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[]
  const stored = new Map(rows.map((row) => [row.key, row.value]))
  const result = {} as Settings
  for (const key of SETTING_KEYS) {
    result[key] = stored.get(key) ?? SETTING_DEFAULTS[key]
  }
  return result
}

export function saveSettings(values: Partial<Settings>): void {
  const upsert = db.prepare(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
  )
  for (const key of SETTING_KEYS) {
    const value = values[key]
    if (value !== undefined) upsert.run(key, value)
  }
}
