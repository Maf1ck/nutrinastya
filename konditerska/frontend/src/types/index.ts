export type ProductState = 'fresh' | 'frozen'

export type OrderStatus = 'new' | 'confirmed' | 'ready' | 'completed' | 'cancelled'

export interface SiteSettings {
  brandName: string
  brandTagline: string
  city: string
  phone: string
  instagram: string
  infoBarText: string
  heroEyebrow: string
  heroTitle: string
  heroText: string
  footerAbout: string
  infoCard1Title: string
  infoCard1Text: string
  infoCard2Title: string
  infoCard2Text: string
  infoCard3Title: string
  infoCard3Text: string
  orderNote: string
}

export interface Category {
  id: number
  slug: string
  name: string
  tileTone: 1 | 2 | 3 | 4
  sortOrder: number
  description: string
  /** Photo uploaded for the category (may be empty). */
  imageUrl: string
  /** Photo shown on the storefront: own photo or the first product's photo. */
  coverUrl: string
  productCount: number
}

export interface Product {
  id: number
  categoryId: number
  categorySlug: string
  name: string
  description: string
  weightLabel: string
  price: number
  imageUrl: string
  hasFresh: boolean
  hasFrozen: boolean
  isPopular: boolean
  isActive: boolean
  sortOrder: number
}

export interface PickupPoint {
  id: number
  name: string
  address: string
  isActive: boolean
  sortOrder: number
}

export type ProductSort = 'popular' | 'price_asc' | 'price_desc'

export interface CartLine {
  productId: number
  state: ProductState
  qty: number
  name: string
  price: number
  weightLabel: string
  imageUrl: string
  hasFresh: boolean
  hasFrozen: boolean
}

export interface OrderPayload {
  /** Honeypot field: always empty for real users. */
  website?: string
  customerName: string
  phone: string
  pickupPointId: number | null
  pickupDate: string
  pickupTime: string
  comment: string
  items: { productId: number; state: ProductState; qty: number }[]
}

export interface OrderResult {
  id: number
  total: number
}

export interface AdminOrderItem {
  id: number
  productId: number | null
  name: string
  state: ProductState
  qty: number
  price: number
}

export interface AdminOrder {
  id: number
  customerName: string
  phone: string
  pickupPoint: string
  pickupDate: string
  pickupTime: string
  comment: string
  total: number
  status: OrderStatus
  createdAt: string
  items: AdminOrderItem[]
}
