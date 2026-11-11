import type { AdminOrder, Category, OrderStatus, PickupPoint, Product, SiteSettings } from '@/types'
import { request } from './client'

export type CategoryInput = Pick<Category, 'name' | 'slug' | 'tileTone' | 'sortOrder' | 'description' | 'imageUrl'>
export type ProductInput = Omit<Product, 'id' | 'categorySlug'>
export type PickupPointInput = Omit<PickupPoint, 'id'>

export function createAdminApi(getToken: () => string | null) {
  const call = <T>(method: Parameters<typeof request>[0], url: string, body?: unknown) =>
    request<T>(method, `/api/admin${url}`, { body, token: getToken() })

  return {
    loginInfo: () => request<{ totp: boolean }>('GET', '/api/admin/login-info'),
    login: (credentials: { username: string; password: string; code: string }) =>
      request<{ token: string }>('POST', '/api/admin/login', { body: credentials }),
    session: () => call<{ ok: true }>('GET', '/session'),

    orders: (status?: OrderStatus) => call<AdminOrder[]>('GET', `/orders${status ? `?status=${status}` : ''}`),
    setOrderStatus: (id: number, status: OrderStatus) => call<{ ok: true }>('PATCH', `/orders/${id}`, { status }),

    categories: () => call<Category[]>('GET', '/categories'),
    createCategory: (data: CategoryInput) => call<Category[]>('POST', '/categories', data),
    updateCategory: (id: number, data: CategoryInput) => call<Category[]>('PUT', `/categories/${id}`, data),
    deleteCategory: (id: number) => call<Category[]>('DELETE', `/categories/${id}`),

    products: () => call<Product[]>('GET', '/products'),
    createProduct: (data: ProductInput) => call<Product[]>('POST', '/products', data),
    updateProduct: (id: number, data: ProductInput) => call<Product[]>('PUT', `/products/${id}`, data),
    deleteProduct: (id: number) => call<Product[]>('DELETE', `/products/${id}`),

    pickupPoints: () => call<PickupPoint[]>('GET', '/pickup-points'),
    createPickupPoint: (data: PickupPointInput) => call<PickupPoint[]>('POST', '/pickup-points', data),
    updatePickupPoint: (id: number, data: PickupPointInput) =>
      call<PickupPoint[]>('PUT', `/pickup-points/${id}`, data),
    deletePickupPoint: (id: number) => call<PickupPoint[]>('DELETE', `/pickup-points/${id}`),

    settings: () => call<SiteSettings>('GET', '/settings'),
    saveSettings: (data: Partial<SiteSettings>) => call<SiteSettings>('PUT', '/settings', data),

    uploadImage: (dataUrl: string) => call<{ url: string }>('POST', '/upload', { dataUrl }),
  }
}
