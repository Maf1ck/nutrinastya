import express, { Router } from 'express'
import { z } from 'zod'
import { onVercel } from '../config.ts'
import { db, transaction } from '../db.ts'
import { HttpError, parse } from '../http.ts'
import { notifyNewOrder } from '../notify.ts'
import { createLimiter } from '../rateLimit.ts'
import {
  CATEGORY_SELECT,
  PRODUCT_SELECT,
  toCategory,
  toPickupPoint,
  toProduct,
  type CategoryRow,
  type PickupPointRow,
  type ProductRow,
} from '../mappers.ts'
import { getSettings } from '../settings.ts'

export const publicRouter = Router()

// Public endpoints only ever receive tiny JSON bodies.
publicRouter.use(express.json({ limit: '20kb' }))

publicRouter.get('/settings', (_req, res) => {
  res.json(getSettings())
})

publicRouter.get('/categories', (_req, res) => {
  const rows = db.prepare(CATEGORY_SELECT).all() as unknown as CategoryRow[]
  res.json(rows.map(toCategory))
})

const productsQuery = z.object({
  category: z.string().optional(),
  state: z.enum(['fresh', 'frozen']).optional(),
  sort: z.enum(['popular', 'price_asc', 'price_desc']).default('popular'),
  popular: z.enum(['1', 'true']).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
})

const PRODUCT_ORDER = {
  popular: 'p.is_popular DESC, p.sales_count DESC, p.sort_order, p.id',
  price_asc: 'p.price ASC, p.id',
  price_desc: 'p.price DESC, p.id',
} as const

publicRouter.get('/products', (req, res) => {
  const query = parse(productsQuery, req.query)
  const where = ['p.is_active = 1']
  const params: (string | number)[] = []

  if (query.category) {
    where.push('c.slug = ?')
    params.push(query.category)
  }
  if (query.state === 'fresh') where.push('p.has_fresh = 1')
  if (query.state === 'frozen') where.push('p.has_frozen = 1')
  if (query.popular) where.push('p.is_popular = 1')

  let sql = `${PRODUCT_SELECT} WHERE ${where.join(' AND ')} ORDER BY ${PRODUCT_ORDER[query.sort]}`
  if (query.limit) {
    sql += ' LIMIT ?'
    params.push(query.limit)
  }

  const rows = db.prepare(sql).all(...params) as unknown as ProductRow[]
  res.json(rows.map(toProduct))
})

publicRouter.get('/pickup-points', (_req, res) => {
  const rows = db
    .prepare('SELECT * FROM pickup_points WHERE is_active = 1 ORDER BY sort_order, id')
    .all() as unknown as PickupPointRow[]
  res.json(rows.map(toPickupPoint))
})

// ---------- Orders ----------

/** Accepts +380XXXXXXXXX, 380XXXXXXXXX and 0XXXXXXXXX; returns +380XXXXXXXXX or null. */
function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/[^\d+]/g, '').replace(/^\+/, '')
  if (/^380\d{9}$/.test(digits)) return `+${digits}`
  if (/^0\d{9}$/.test(digits)) return `+38${digits}`
  return null
}

function todayIso(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

function currentTime(): string {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

/** 5 orders per 10 minutes per IP, and at most 5 per phone number per day. */
const orderLimiter = createLimiter({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: 'Забагато замовлень з вашої адреси. Спробуйте пізніше або зателефонуйте нам',
})
const MAX_ORDERS_PER_PHONE_PER_DAY = 5
const MAX_DAYS_AHEAD = 90

const orderSchema = z.object({
  /** Honeypot: hidden from people, bots fill it in. */
  website: z.string().max(200).optional(),
  customerName: z.string().trim().min(2, 'Введіть ім’я').max(80, 'Занадто довге ім’я'),
  phone: z.string().trim().min(1, 'Введіть телефон').max(30, 'Занадто довгий номер'),
  pickupPointId: z.number({ error: 'Оберіть адресу самовивозу' }).int().positive('Оберіть адресу самовивозу'),
  pickupDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Оберіть дату'),
  pickupTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Оберіть час'),
  comment: z.string().trim().max(500, 'Максимум 500 символів').default(''),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        state: z.enum(['fresh', 'frozen']),
        qty: z.number().int().min(1).max(99),
      }),
    )
    .min(1, 'Кошик порожній')
    .max(50),
})

publicRouter.post('/orders', orderLimiter.hit, async (req, res) => {
  const data = parse(orderSchema, req.body)

  // Pretend success to bots so they do not learn they were detected.
  if (data.website) {
    res.status(201).json({ id: 0, total: 0 })
    return
  }

  const phone = normalizePhone(data.phone)
  if (!phone) throw new HttpError(400, 'Перевірте правильність введених даних', { phone: 'Вкажіть номер у форматі +380XXXXXXXXX' })

  const today = todayIso()
  if (data.pickupDate < today) throw new HttpError(400, 'Перевірте правильність введених даних', { pickupDate: 'Дата вже минула' })
  if (data.pickupDate === today && data.pickupTime <= currentTime()) {
    throw new HttpError(400, 'Перевірте правильність введених даних', { pickupTime: 'Оберіть пізніший час' })
  }

  const lastDay = new Date()
  lastDay.setDate(lastDay.getDate() + MAX_DAYS_AHEAD)
  const lastDayIso = `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`
  if (data.pickupDate > lastDayIso) {
    throw new HttpError(400, 'Перевірте правильність введених даних', {
      pickupDate: `Замовлення приймаємо не далі ніж на ${MAX_DAYS_AHEAD} днів уперед`,
    })
  }

  const recent = db
    .prepare("SELECT COUNT(*) AS count FROM orders WHERE phone = ? AND created_at > datetime('now', '-1 day')")
    .get(phone) as unknown as { count: number }
  if (recent.count >= MAX_ORDERS_PER_PHONE_PER_DAY) {
    throw new HttpError(429, 'З цього номера вже оформлено забагато замовлень. Зателефонуйте нам')
  }

  const point = db
    .prepare('SELECT * FROM pickup_points WHERE id = ? AND is_active = 1')
    .get(data.pickupPointId) as unknown as PickupPointRow | undefined
  if (!point) throw new HttpError(400, 'Перевірте правильність введених даних', { pickupPointId: 'Оберіть адресу самовивозу' })

  // Merge duplicate lines (same product and state).
  const lines = new Map<string, { productId: number; state: 'fresh' | 'frozen'; qty: number }>()
  for (const item of data.items) {
    const key = `${item.productId}:${item.state}`
    const existing = lines.get(key)
    if (existing) existing.qty = Math.min(99, existing.qty + item.qty)
    else lines.set(key, { ...item })
  }

  const created = transaction(() => {
    const getProduct = db.prepare('SELECT * FROM products WHERE id = ? AND is_active = 1')
    const priced = [...lines.values()].map((line) => {
      const product = getProduct.get(line.productId) as unknown as ProductRow | undefined
      if (!product) throw new HttpError(409, 'Один із товарів більше недоступний. Оновіть кошик')
      if ((line.state === 'fresh' && !product.has_fresh) || (line.state === 'frozen' && !product.has_frozen)) {
        throw new HttpError(409, `«${product.name}» недоступний у вибраному стані`)
      }
      return { ...line, name: product.name, price: product.price }
    })

    const total = priced.reduce((sum, line) => sum + line.price * line.qty, 0)
    const label = `${point.name} — ${point.address}`

    const result = db
      .prepare(
        `INSERT INTO orders
           (customer_name, phone, pickup_point_id, pickup_point_label, pickup_date, pickup_time, comment, total)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(data.customerName, phone, point.id, label, data.pickupDate, data.pickupTime, data.comment, total)
    const id = Number(result.lastInsertRowid)

    const insertItem = db.prepare(
      'INSERT INTO order_items (order_id, product_id, name, state, qty, price) VALUES (?, ?, ?, ?, ?, ?)',
    )
    const bumpSales = db.prepare('UPDATE products SET sales_count = sales_count + ? WHERE id = ?')
    for (const line of priced) {
      insertItem.run(id, line.productId, line.name, line.state, line.qty, line.price)
      bumpSales.run(line.qty, line.productId)
    }
    return { id, total, label, priced }
  })

  // notifyNewOrder never throws and times out after a few seconds. Locally it runs in the
  // background; on Vercel the function can be frozen right after the response, so wait for it.
  const notification = notifyNewOrder({
    id: created.id,
    customerName: data.customerName,
    phone,
    pickupPoint: created.label,
    pickupDate: data.pickupDate,
    pickupTime: data.pickupTime,
    comment: data.comment,
    total: created.total,
    items: created.priced,
  })
  if (onVercel) await notification

  res.status(201).json({ id: created.id, total: created.total })
})
