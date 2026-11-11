const priceFormatter = new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 0 })

export function formatPrice(value: number): string {
  return `${priceFormatter.format(value).replace(/ /g, ' ')} ₴`
}

/** Ukrainian plural: pluralize(3, ['позиція', 'позиції', 'позицій']) → "позиції". */
export function pluralize(count: number, forms: [string, string, string]): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return forms[0]
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1]
  return forms[2]
}

export function formatDateTime(value: string): string {
  const date = new Date(value.replace(' ', 'T') + 'Z')
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function formatPickupDate(value: string): string {
  const [year, month, day] = value.split('-')
  return year && month && day ? `${day}.${month}.${year}` : value
}

export const STATE_LABELS = { fresh: 'Свіжий', frozen: 'Заморожений' } as const
