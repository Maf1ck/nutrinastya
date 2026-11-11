import type {
  Category,
  OrderPayload,
  OrderResult,
  PickupPoint,
  Product,
  ProductSort,
  ProductState,
  SiteSettings,
} from '@/types'
import { api } from './client'

export interface ProductFilters {
  category?: string
  state?: ProductState
  sort?: ProductSort
  popular?: boolean
  limit?: number
}

export const shopApi = {
  settings: () => api.get<SiteSettings>('/api/settings'),
  categories: () => api.get<Category[]>('/api/categories'),
  pickupPoints: () => api.get<PickupPoint[]>('/api/pickup-points'),
  products: (filters: ProductFilters = {}) => {
    const params = new URLSearchParams()
    if (filters.category) params.set('category', filters.category)
    if (filters.state) params.set('state', filters.state)
    if (filters.sort) params.set('sort', filters.sort)
    if (filters.popular) params.set('popular', '1')
    if (filters.limit) params.set('limit', String(filters.limit))
    const query = params.toString()
    return api.get<Product[]>(`/api/products${query ? `?${query}` : ''}`)
  },
  createOrder: (payload: OrderPayload) => api.post<OrderResult>('/api/orders', payload),
}
