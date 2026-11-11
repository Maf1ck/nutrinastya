import { createRouter, createWebHistory } from 'vue-router'

// The admin URL can be hidden: set VITE_ADMIN_PATH=my-secret-panel in frontend/.env before building.
const adminPath = (import.meta.env.VITE_ADMIN_PATH as string | undefined)?.replace(/^\/+|\/+$/g, '') || 'admin'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },
    { path: '/catalog', name: 'catalog', component: () => import('@/views/CategoryView.vue') },
    { path: '/category/:slug', name: 'category', component: () => import('@/views/CategoryView.vue'), props: true },
    { path: '/cart', name: 'cart', component: () => import('@/views/CartView.vue') },
    { path: '/order/success', name: 'order-success', component: () => import('@/views/OrderSuccessView.vue') },
    {
      path: `/${adminPath}`,
      component: () => import('@/views/admin/AdminLayout.vue'),
      meta: { admin: true },
      children: [
        { path: '', redirect: { name: 'admin-orders' } },
        { path: 'orders', name: 'admin-orders', component: () => import('@/views/admin/AdminOrders.vue') },
        { path: 'products', name: 'admin-products', component: () => import('@/views/admin/AdminProducts.vue') },
        { path: 'categories', name: 'admin-categories', component: () => import('@/views/admin/AdminCategories.vue') },
        { path: 'pickup', name: 'admin-pickup', component: () => import('@/views/admin/AdminPickupPoints.vue') },
        { path: 'settings', name: 'admin-settings', component: () => import('@/views/admin/AdminSettings.vue') },
      ],
    },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/NotFoundView.vue') },
  ],
  scrollBehavior(to, _from, saved) {
    if (saved) return saved
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
})
