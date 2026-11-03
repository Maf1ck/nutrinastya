import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { HOME_SEO } from '@/config/seo'
import { ARTICLE_BY_SLUG } from '@/content/blog'

const LegalView = () => import('@/views/LegalView.vue')
const BlogListView = () => import('@/views/BlogListView.vue')
const BlogArticleView = () => import('@/views/BlogArticleView.vue')
const legal = (path: string, doc: string) => ({ path, name: doc, component: LegalView, props: { doc } })

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/blog', name: 'blog', component: BlogListView },
    {
      path: '/blog/:slug',
      name: 'article',
      component: BlogArticleView,
      props: true,
    },
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

// невідома стаття → список статей (beforeEach, бо beforeEnter не спрацьовує при зміні лише :slug)
router.beforeEach((to) => {
  if (to.name === 'article' && !ARTICLE_BY_SLUG[to.params.slug as string]) return { name: 'blog' }
})

router.afterEach((to) => {
  if (to.name === 'home') document.title = HOME_SEO.title
})

export default router
