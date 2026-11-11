import { randomUUID } from 'node:crypto'
import { mkdirSync, unlinkSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import express, { Router } from 'express'
import { z } from 'zod'
import { checkPassword, checkUsername, createToken, globalLoginLimiter, loginLimiter, requireAdmin } from '../auth.ts'
import { config } from '../config.ts'
import { db } from '../db.ts'
import { HttpError, parse, parseId } from '../http.ts'
import {
  CATEGORY_SELECT,
  PRODUCT_SELECT,
  toCategory,
  toOrder,
  toPickupPoint,
  toProduct,
  type CategoryRow,
  type OrderItemRow,
  type OrderRow,
  type PickupPointRow,
  type ProductRow,
} from '../mappers.ts'
import { getSettings, saveSettings, SETTING_KEYS, type Settings } from '../settings.ts'
import { verifyTotp } from '../totp.ts'

export const adminRouter = Router()

// Only the image upload needs a large body; everything else is tiny.
adminRouter.use(express.json({ limit: '8mb' }))

/** Only our own uploads or absolute https URLs may be used as image sources. */
const imageUrlSchema = z
  .string()
  .trim()
  .max(500)
  .refine((value) => value === '' || /^\/uploads\/[\w.-]+$/.test(value) || /^https:\/\/[^\s"'<>]+$/.test(value), {
    message: 'Дозволені лише завантажені фото або посилання https://',
  })
  .default('')

/** Lets the login form know whether to ask for a 2FA code. */
adminRouter.get('/login-info', (_req, res) => {
  res.json({ totp: Boolean(config.adminTotpSecret) })
})

const loginSchema = z.object({
  username: z.string().max(100).default(''),
  password: z.string().min(1, 'Введіть пароль').max(200),
  code: z.string().max(10).default(''),
})

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

adminRouter.post('/login', loginLimiter.guard, globalLoginLimiter.guard, async (req, res) => {
  const { username, password, code } = parse(loginSchema, req.body)

  // Every part is checked in constant time; the answer never says which one was wrong.
  const credentialsOk = checkUsername(username) && checkPassword(password)
  // The one-time code is only consumed when the password was right.
  const codeOk = !config.adminTotpSecret || (credentialsOk && verifyTotp(config.adminTotpSecret, code.trim()))

  if (!credentialsOk || !codeOk) {
    loginLimiter.fail(req)
    globalLoginLimiter.fail(req)
    await sleep(900) // slows down guessing
    throw new HttpError(401, 'Невірний логін, пароль або код')
  }
  loginLimiter.reset(req)
  res.json({ token: createToken() })
})

adminRouter.use(requireAdmin)

adminRouter.get('/session', (_req, res) => {
  res.json({ ok: true })
})

// ---------- Orders ----------

const ORDER_STATUSES = ['new', 'confirmed', 'ready', 'completed', 'cancelled'] as const

adminRouter.get('/orders', (req, res) => {
  const { status } = parse(z.object({ status: z.enum(ORDER_STATUSES).optional() }), req.query)
  const rows = (
    status
      ? db.prepare('SELECT * FROM orders WHERE status = ? ORDER BY id DESC LIMIT 200').all(status)
      : db.prepare('SELECT * FROM orders ORDER BY id DESC LIMIT 200').all()
  ) as unknown as OrderRow[]

  const itemsStmt = db.prepare('SELECT * FROM order_items WHERE order_id = ? ORDER BY id')
  res.json(rows.map((row) => toOrder(row, itemsStmt.all(row.id) as unknown as OrderItemRow[])))
})

adminRouter.patch('/orders/:id', (req, res) => {
  const id = parseId(req.params.id)
  const { status } = parse(z.object({ status: z.enum(ORDER_STATUSES) }), req.body)
  const result = db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, id)
  if (result.changes === 0) throw new HttpError(404, 'Замовлення не знайдено')
  res.json({ ok: true })
})

// ---------- Categories ----------

const categorySchema = z.object({
  name: z.string().trim().min(1, 'Вкажіть назву').max(80),
  slug: z
    .string()
    .trim()
    .min(1, 'Вкажіть slug')
    .max(80)
    .regex(/^[a-z0-9-]+$/, 'Лише латиниця, цифри та дефіс'),
  tileTone: z.number().int().min(1).max(4),
  sortOrder: z.number().int().default(0),
  description: z.string().trim().max(120, 'Максимум 120 символів').default(''),
  imageUrl: imageUrlSchema,
})

function listCategories() {
  const rows = db.prepare(CATEGORY_SELECT).all() as unknown as CategoryRow[]
  return rows.map(toCategory)
}

function slugTaken(slug: string, exceptId = 0): boolean {
  return db.prepare('SELECT 1 FROM categories WHERE slug = ? AND id != ?').get(slug, exceptId) !== undefined
}

adminRouter.get('/categories', (_req, res) => {
  res.json(listCategories())
})

adminRouter.post('/categories', (req, res) => {
  const data = parse(categorySchema, req.body)
  if (slugTaken(data.slug)) throw new HttpError(400, 'Slug вже використовується', { slug: 'Slug вже використовується' })
  db.prepare(
    'INSERT INTO categories (slug, name, tile_tone, sort_order, description, image_url) VALUES (?, ?, ?, ?, ?, ?)',
  ).run(data.slug, data.name, data.tileTone, data.sortOrder, data.description, data.imageUrl)
  res.status(201).json(listCategories())
})

adminRouter.put('/categories/:id', (req, res) => {
  const id = parseId(req.params.id)
  const data = parse(categorySchema, req.body)
  if (slugTaken(data.slug, id)) throw new HttpError(400, 'Slug вже використовується', { slug: 'Slug вже використовується' })
  const result = db
    .prepare(
      'UPDATE categories SET slug = ?, name = ?, tile_tone = ?, sort_order = ?, description = ?, image_url = ? WHERE id = ?',
    )
    .run(data.slug, data.name, data.tileTone, data.sortOrder, data.description, data.imageUrl, id)
  if (result.changes === 0) throw new HttpError(404, 'Категорію не знайдено')
  res.json(listCategories())
})

adminRouter.delete('/categories/:id', (req, res) => {
  const id = parseId(req.params.id)
  const used = db.prepare('SELECT COUNT(*) AS count FROM products WHERE category_id = ?').get(id) as unknown as {
    count: number
  }
  if (used.count > 0) throw new HttpError(409, 'Спершу видаліть або перенесіть товари цієї категорії')
  db.prepare('DELETE FROM categories WHERE id = ?').run(id)
  res.json(listCategories())
})

// ---------- Products ----------

const productSchema = z.object({
  categoryId: z.number().int().positive('Оберіть категорію'),
  name: z.string().trim().min(1, 'Вкажіть назву').max(120),
  description: z.string().trim().max(1000).default(''),
  weightLabel: z.string().trim().max(40).default(''),
  price: z.number().int().min(0, 'Ціна не може бути від’ємною'),
  imageUrl: imageUrlSchema,
  hasFresh: z.boolean(),
  hasFrozen: z.boolean(),
  isPopular: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
})

function listProducts() {
  const rows = db
    .prepare(`${PRODUCT_SELECT} ORDER BY c.sort_order, p.sort_order, p.id`)
    .all() as unknown as ProductRow[]
  return rows.map(toProduct)
}

function assertProductData(data: z.infer<typeof productSchema>): void {
  if (!data.hasFresh && !data.hasFrozen) {
    throw new HttpError(400, 'Оберіть хоча б один стан товару', { hasFresh: 'Оберіть хоча б один стан' })
  }
  const category = db.prepare('SELECT 1 FROM categories WHERE id = ?').get(data.categoryId)
  if (!category) throw new HttpError(400, 'Категорію не знайдено', { categoryId: 'Оберіть категорію' })
}

adminRouter.get('/products', (_req, res) => {
  res.json(listProducts())
})

adminRouter.post('/products', (req, res) => {
  const data = parse(productSchema, req.body)
  assertProductData(data)
  db.prepare(
    `INSERT INTO products
       (category_id, name, description, weight_label, price, image_url, has_fresh, has_frozen, is_popular, is_active, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    data.categoryId,
    data.name,
    data.description,
    data.weightLabel,
    data.price,
    data.imageUrl,
    Number(data.hasFresh),
    Number(data.hasFrozen),
    Number(data.isPopular),
    Number(data.isActive),
    data.sortOrder,
  )
  res.status(201).json(listProducts())
})

adminRouter.put('/products/:id', (req, res) => {
  const id = parseId(req.params.id)
  const data = parse(productSchema, req.body)
  assertProductData(data)
  const result = db
    .prepare(
      `UPDATE products SET
         category_id = ?, name = ?, description = ?, weight_label = ?, price = ?, image_url = ?,
         has_fresh = ?, has_frozen = ?, is_popular = ?, is_active = ?, sort_order = ?
       WHERE id = ?`,
    )
    .run(
      data.categoryId,
      data.name,
      data.description,
      data.weightLabel,
      data.price,
      data.imageUrl,
      Number(data.hasFresh),
      Number(data.hasFrozen),
      Number(data.isPopular),
      Number(data.isActive),
      data.sortOrder,
      id,
    )
  if (result.changes === 0) throw new HttpError(404, 'Товар не знайдено')
  res.json(listProducts())
})

adminRouter.delete('/products/:id', (req, res) => {
  const id = parseId(req.params.id)
  db.prepare('DELETE FROM products WHERE id = ?').run(id)
  res.json(listProducts())
})

// ---------- Pickup points ----------

const pickupSchema = z.object({
  name: z.string().trim().min(1, 'Вкажіть назву').max(80),
  address: z.string().trim().min(1, 'Вкажіть адресу').max(200),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
})

function listPickupPoints() {
  const rows = db
    .prepare('SELECT * FROM pickup_points ORDER BY sort_order, id')
    .all() as unknown as PickupPointRow[]
  return rows.map(toPickupPoint)
}

adminRouter.get('/pickup-points', (_req, res) => {
  res.json(listPickupPoints())
})

adminRouter.post('/pickup-points', (req, res) => {
  const data = parse(pickupSchema, req.body)
  db.prepare('INSERT INTO pickup_points (name, address, is_active, sort_order) VALUES (?, ?, ?, ?)').run(
    data.name,
    data.address,
    Number(data.isActive),
    data.sortOrder,
  )
  res.status(201).json(listPickupPoints())
})

adminRouter.put('/pickup-points/:id', (req, res) => {
  const id = parseId(req.params.id)
  const data = parse(pickupSchema, req.body)
  const result = db
    .prepare('UPDATE pickup_points SET name = ?, address = ?, is_active = ?, sort_order = ? WHERE id = ?')
    .run(data.name, data.address, Number(data.isActive), data.sortOrder, id)
  if (result.changes === 0) throw new HttpError(404, 'Точку не знайдено')
  res.json(listPickupPoints())
})

adminRouter.delete('/pickup-points/:id', (req, res) => {
  const id = parseId(req.params.id)
  db.prepare('DELETE FROM pickup_points WHERE id = ?').run(id)
  res.json(listPickupPoints())
})

// ---------- Settings ----------

const settingsSchema = z.object(
  Object.fromEntries(SETTING_KEYS.map((key) => [key, z.string().trim().max(500).optional()])) as Record<
    keyof Settings,
    z.ZodOptional<z.ZodString>
  >,
)

adminRouter.get('/settings', (_req, res) => {
  res.json(getSettings())
})

adminRouter.put('/settings', (req, res) => {
  saveSettings(parse(settingsSchema, req.body))
  res.json(getSettings())
})

// ---------- Image upload (base64 data URL, no extra dependencies) ----------

const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
}

adminRouter.post('/upload', (req, res) => {
  const { dataUrl } = parse(z.object({ dataUrl: z.string().min(1) }), req.body)
  const match = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl)
  const mime = match?.[1]
  const payload = match?.[2]
  const extension = mime ? IMAGE_EXTENSIONS[mime] : undefined
  if (!payload || !extension) throw new HttpError(400, 'Підтримуються лише PNG, JPEG та WebP')

  const buffer = Buffer.from(payload, 'base64')
  if (buffer.length > 5 * 1024 * 1024) throw new HttpError(413, 'Файл завеликий (максимум 5 МБ)')
  // Do not trust the declared type: check the real file signature.
  const isPng = buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
  const isWebp = buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  const expected = { png: isPng, jpg: isJpeg, webp: isWebp }[extension as 'png' | 'jpg' | 'webp']
  if (!expected) throw new HttpError(400, 'Файл не є коректним зображенням')

  mkdirSync(config.uploadsDir, { recursive: true })
  const fileName = `${randomUUID()}.${extension}`
  writeFileSync(path.join(config.uploadsDir, fileName), buffer)
  res.status(201).json({ url: `/uploads/${fileName}` })
})

adminRouter.delete('/upload', (req, res) => {
  const { url } = parse(z.object({ url: z.string() }), req.query)
  const name = path.basename(url)
  if (url !== `/uploads/${name}` || name.startsWith('demo-')) {
    res.json({ ok: true })
    return
  }
  try {
    unlinkSync(path.join(config.uploadsDir, name))
  } catch {
    // File is already gone — nothing to clean up.
  }
  res.json({ ok: true })
})
