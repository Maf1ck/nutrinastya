import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { HOME_SEO } from '@/config/seo'

const LegalView = () => import('@/views/LegalView.vue')
const legal = (path: string, doc: string) => ({ path, name: doc, component: LegalView, props: { doc } })

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    legal('/privacy', 'privacy'),
    legal('/terms', 'terms'),
    legal('/disclaimer', 'disclaimer'),
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, top: 90, behavior: 'smooth' }
    return { top: 0 }
  },
})

router.afterEach((to) => {
  if (to.name === 'home') document.title = HOME_SEO.title
})

export default router
