export interface CategoryRow {
  id: number
  slug: string
  name: string
  tile_tone: number
  sort_order: number
  description: string
  image_url: string
  /** First active product photo, used when the category has no own photo. */
  fallback_image?: string | null
  product_count?: number
}

export interface ProductRow {
  id: number
  category_id: number
  category_slug: string
  name: string
  description: string
  weight_label: string
  price: number
  image_url: string
  has_fresh: number
  has_frozen: number
  is_popular: number
  is_active: number
  sales_count: number
  sort_order: number
}

export interface PickupPointRow {
  id: number
  name: string
  address: string
  is_active: number
  sort_order: number
}

export interface OrderRow {
  id: number
  customer_name: string
  phone: string
  pickup_point_id: number | null
  pickup_point_label: string
  pickup_date: string
  pickup_time: string
  comment: string
  total: number
  status: string
  created_at: string
}

export interface OrderItemRow {
  id: number
  order_id: number
  product_id: number | null
  name: string
  state: 'fresh' | 'frozen'
  qty: number
  price: number
}

export const toCategory = (row: CategoryRow) => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  tileTone: row.tile_tone,
  sortOrder: row.sort_order,
  description: row.description,
  imageUrl: row.image_url,
  /** What the storefront shows: own photo or the first product's photo. */
  coverUrl: row.image_url || row.fallback_image || '',
  productCount: row.product_count ?? 0,
})

export const CATEGORY_SELECT = `
  SELECT c.*,
    COUNT(p.id) AS product_count,
    (SELECT p2.image_url FROM products p2
      WHERE p2.category_id = c.id AND p2.is_active = 1 AND p2.image_url != ''
      ORDER BY p2.is_popular DESC, p2.sort_order, p2.id LIMIT 1) AS fallback_image
  FROM categories c
  LEFT JOIN products p ON p.category_id = c.id AND p.is_active = 1
  GROUP BY c.id
  ORDER BY c.sort_order, c.id
`

export const toProduct = (row: ProductRow) => ({
  id: row.id,
  categoryId: row.category_id,
  categorySlug: row.category_slug,
  name: row.name,
  description: row.description,
  weightLabel: row.weight_label,
  price: row.price,
  imageUrl: row.image_url,
  hasFresh: row.has_fresh === 1,
  hasFrozen: row.has_frozen === 1,
  isPopular: row.is_popular === 1,
  isActive: row.is_active === 1,
  sortOrder: row.sort_order,
})

export const toPickupPoint = (row: PickupPointRow) => ({
  id: row.id,
  name: row.name,
  address: row.address,
  isActive: row.is_active === 1,
  sortOrder: row.sort_order,
})

export const toOrder = (row: OrderRow, items: OrderItemRow[]) => ({
  id: row.id,
  customerName: row.customer_name,
  phone: row.phone,
  pickupPoint: row.pickup_point_label,
  pickupDate: row.pickup_date,
  pickupTime: row.pickup_time,
  comment: row.comment,
  total: row.total,
  status: row.status,
  createdAt: row.created_at,
  items: items.map((item) => ({
    id: item.id,
    productId: item.product_id,
    name: item.name,
    state: item.state,
    qty: item.qty,
    price: item.price,
  })),
})

export const PRODUCT_SELECT = `
  SELECT p.*, c.slug AS category_slug
  FROM products p
  JOIN categories c ON c.id = p.category_id
`
