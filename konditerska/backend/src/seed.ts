import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { config } from './config.ts'
import { db, transaction } from './db.ts'

interface SeedCategory {
  slug: string
  name: string
  tone: number
  description: string
}

interface SeedProduct {
  category: string
  name: string
  weight: string
  price: number
  image: string
  popular?: boolean
  frozen?: boolean
}

const categories: SeedCategory[] = [
  { slug: 'torty', name: 'Торти', tone: 1, description: 'Святкові та ягідні, цілі торти на компанію' },
  { slug: 'tistechka', name: 'Тістечка', tone: 2, description: 'Порційні тістечка та макаронс до чаю' },
  { slug: 'ekleri-ta-profiteroli', name: 'Еклери та профітролі', tone: 3, description: 'Заварні еклери та профітролі з кремом' },
  { slug: 'chyzkeiky', name: 'Чизкейки', tone: 4, description: 'Ніжні чизкейки на одну порцію' },
  { slug: 'deserty', name: 'Десерти', tone: 2, description: 'Десерти в склянці: тірамісу, ягідні та кремові' },
  { slug: 'pyrohy-ta-kishi', name: 'Пироги та кіші', tone: 1, description: 'Солоні та солодкі пироги, кіші' },
  { slug: 'pechyvo', name: 'Печиво', tone: 4, description: 'Домашнє печиво на вагу' },
  { slug: 'kava-ta-napoi', name: 'Кава та напої', tone: 3, description: 'Кава та напої до десерту' },
]

// Demo photos are bundled in `seed-images/` and copied to the uploads folder.
const products: SeedProduct[] = [
  { category: 'torty', name: 'Ягідний торт', weight: '1,2 кг', price: 650, image: 'berry-cake.png', popular: true },
  { category: 'torty', name: 'Ванільний торт з ягодами', weight: '1,2 кг', price: 650, image: 'berry-cake.png', popular: true },
  { category: 'torty', name: 'Шоколадний торт', weight: '1,4 кг', price: 720, image: 'berry-cake.png' },
  { category: 'torty', name: 'Медовик', weight: '1,0 кг', price: 540, image: 'berry-cake.png' },
  { category: 'tistechka', name: 'Тістечко «Картопля»', weight: '4 шт', price: 140, image: 'raspberry-dessert.png' },
  { category: 'tistechka', name: 'Макаронс', weight: '6 шт', price: 210, image: 'raspberry-dessert.png' },
  { category: 'ekleri-ta-profiteroli', name: 'Шоколадні еклери', weight: '6 шт', price: 180, image: 'eclairs.png', popular: true },
  { category: 'ekleri-ta-profiteroli', name: 'Профітролі з шоколадом', weight: '6 шт', price: 180, image: 'eclairs.png' },
  { category: 'ekleri-ta-profiteroli', name: 'Еклери з ванільним кремом', weight: '6 шт', price: 190, image: 'eclairs.png' },
  { category: 'chyzkeiky', name: 'Чизкейк з малиною', weight: '150 г', price: 95, image: 'raspberry-dessert.png' },
  { category: 'chyzkeiky', name: 'Чизкейк Нью-Йорк', weight: '150 г', price: 90, image: 'raspberry-dessert.png' },
  { category: 'deserty', name: 'Малиновий десерт', weight: '150 г', price: 95, image: 'raspberry-dessert.png', popular: true },
  { category: 'deserty', name: 'Тірамісу', weight: '150 г', price: 100, image: 'raspberry-dessert.png' },
  { category: 'pyrohy-ta-kishi', name: 'Кіш з куркою та грибами', weight: '800 г', price: 320, image: 'eclairs.png' },
  { category: 'pechyvo', name: 'Вівсяне печиво', weight: '300 г', price: 110, image: 'eclairs.png', frozen: false },
  { category: 'kava-ta-napoi', name: 'Лате', weight: '250 мл', price: 65, image: 'eclairs.png', frozen: false },
]

const pickupPoints = [
  { name: 'Точка 1', address: '[Адреса 1]' },
  { name: 'Точка 2', address: '[Адреса 2]' },
  { name: 'Точка 3', address: '[Адреса 3]' },
]

function copyDemoImage(fileName: string): string {
  mkdirSync(config.uploadsDir, { recursive: true })
  const target = `demo-${fileName}`
  const targetPath = path.join(config.uploadsDir, target)
  if (!existsSync(targetPath)) copyFileSync(path.join(config.seedImagesDir, fileName), targetPath)
  return `/uploads/${target}`
}

/** Fills an empty database with demo data. Does nothing when categories already exist. */
export function seedIfEmpty(): boolean {
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM categories').get() as { count: number }
  if (count > 0) return false

  transaction(() => {
    const insertCategory = db.prepare(
      'INSERT INTO categories (slug, name, tile_tone, sort_order, description) VALUES (?, ?, ?, ?, ?)',
    )
    const categoryIds = new Map<string, number>()
    categories.forEach((category, index) => {
      const result = insertCategory.run(category.slug, category.name, category.tone, index, category.description)
      categoryIds.set(category.slug, Number(result.lastInsertRowid))
    })

    const insertProduct = db.prepare(`
      INSERT INTO products
        (category_id, name, weight_label, price, image_url, has_fresh, has_frozen, is_popular, sort_order)
      VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)
    `)
    products.forEach((product, index) => {
      insertProduct.run(
        categoryIds.get(product.category) ?? 0,
        product.name,
        product.weight,
        product.price,
        copyDemoImage(product.image),
        product.frozen === false ? 0 : 1,
        product.popular ? 1 : 0,
        index,
      )
    })

    const insertPoint = db.prepare('INSERT INTO pickup_points (name, address, sort_order) VALUES (?, ?, ?)')
    pickupPoints.forEach((point, index) => insertPoint.run(point.name, point.address, index))
  })

  return true
}
