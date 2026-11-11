import { config } from './config.ts'

export interface OrderNotification {
  id: number
  customerName: string
  phone: string
  pickupPoint: string
  pickupDate: string
  pickupTime: string
  comment: string
  total: number
  items: { name: string; state: 'fresh' | 'frozen'; qty: number; price: number }[]
}

const escapeHtml = (value: string) =>
  value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

/**
 * Sends a Telegram message about a new order when TELEGRAM_BOT_TOKEN and
 * TELEGRAM_CHAT_ID are set. Never throws: a failed notification must not fail the order.
 */
export async function notifyNewOrder(order: OrderNotification): Promise<void> {
  if (!config.telegramToken || !config.telegramChatId) return

  const [year, month, day] = order.pickupDate.split('-')
  const lines = order.items.map(
    (item) =>
      `• ${escapeHtml(item.name)} (${item.state === 'fresh' ? 'свіжий' : 'заморожений'}) × ${item.qty} — ${item.price * item.qty} ₴`,
  )
  const text = [
    `🧁 <b>Нове замовлення №${order.id}</b>`,
    `${escapeHtml(order.customerName)}, ${escapeHtml(order.phone)}`,
    `📍 ${escapeHtml(order.pickupPoint)}`,
    `🕒 ${day}.${month}.${year} о ${order.pickupTime}`,
    '',
    ...lines,
    '',
    `<b>Разом: ${order.total} ₴</b> (оплата при отриманні)`,
    order.comment ? `💬 ${escapeHtml(order.comment)}` : '',
  ]
    .filter((line, index, all) => line !== '' || all[index - 1] !== '')
    .join('\n')

  try {
    const response = await fetch(`https://api.telegram.org/bot${config.telegramToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: config.telegramChatId, text, parse_mode: 'HTML' }),
      signal: AbortSignal.timeout(4000),
    })
    if (!response.ok) console.error(`Telegram notification failed: HTTP ${response.status}`)
  } catch (error) {
    console.error('Telegram notification failed:', error instanceof Error ? error.message : error)
  }
}
