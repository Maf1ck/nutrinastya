import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { config } from './config.ts'

mkdirSync(path.dirname(config.dbPath), { recursive: true })

export const db = new DatabaseSync(config.dbPath)

db.exec('PRAGMA journal_mode = WAL')
db.exec('PRAGMA foreign_keys = ON')

db.exec(`
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  slug       TEXT NOT NULL UNIQUE,
  name       TEXT NOT NULL,
  tile_tone  INTEGER NOT NULL DEFAULT 1 CHECK (tile_tone BETWEEN 1 AND 4),
  sort_order INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  image_url   TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS products (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id  INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  description  TEXT NOT NULL DEFAULT '',
  weight_label TEXT NOT NULL DEFAULT '',
  price        INTEGER NOT NULL CHECK (price >= 0),
  image_url    TEXT NOT NULL DEFAULT '',
  has_fresh    INTEGER NOT NULL DEFAULT 1,
  has_frozen   INTEGER NOT NULL DEFAULT 1,
  is_popular   INTEGER NOT NULL DEFAULT 0,
  is_active    INTEGER NOT NULL DEFAULT 1,
  sales_count  INTEGER NOT NULL DEFAULT 0,
  sort_order   INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);

CREATE TABLE IF NOT EXISTS pickup_points (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  address    TEXT NOT NULL,
  is_active  INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS orders (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_name      TEXT NOT NULL,
  phone              TEXT NOT NULL,
  pickup_point_id    INTEGER REFERENCES pickup_points(id) ON DELETE SET NULL,
  pickup_point_label TEXT NOT NULL,
  pickup_date        TEXT NOT NULL,
  pickup_time        TEXT NOT NULL,
  comment            TEXT NOT NULL DEFAULT '',
  total              INTEGER NOT NULL,
  status             TEXT NOT NULL DEFAULT 'new'
                     CHECK (status IN ('new','confirmed','ready','completed','cancelled')),
  created_at         TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS order_items (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  name       TEXT NOT NULL,
  state      TEXT NOT NULL CHECK (state IN ('fresh','frozen')),
  qty        INTEGER NOT NULL CHECK (qty > 0),
  price      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
`)

// Lightweight migrations for databases created before a column existed.
function ensureColumn(table: string, column: string, definition: string): void {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all() as unknown as { name: string }[]
  if (!columns.some((item) => item.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`)
  }
}
ensureColumn('categories', 'description', "TEXT NOT NULL DEFAULT ''")
ensureColumn('categories', 'image_url', "TEXT NOT NULL DEFAULT ''")

/** Runs `fn` inside a transaction and rolls back on any error. */
export function transaction<T>(fn: () => T): T {
  db.exec('BEGIN')
  try {
    const result = fn()
    db.exec('COMMIT')
    return result
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }
}
