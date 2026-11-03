<script setup lang="ts">
import { computed, ref } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import BlogCard from '@/components/BlogCard.vue'
import AppFooter from '@/components/AppFooter.vue'
import ScrollTopButton from '@/components/ScrollTopButton.vue'
import { ARTICLES_SORTED, BLOG_CATEGORIES, BLOG_LEAD, type BlogCategory } from '@/content/blog'
import { BLOG_SEO } from '@/config/seo'

document.title = BLOG_SEO.title

// показуємо лише категорії, в яких є статті
const categories = BLOG_CATEGORIES.filter((c) => ARTICLES_SORTED.some((a) => a.category === c))
const active = ref<BlogCategory | null>(null)
const list = computed(() => (active.value ? ARTICLES_SORTED.filter((a) => a.category === active.value) : ARTICLES_SORTED))
</script>

<template lang="pug">
PageHeader
main.container.blog-page
  .blog-page__intro
    nav.breadcrumbs(aria-label='Навігаційний ланцюжок')
      RouterLink(to='/') Головна
      span(aria-hidden='true')  /
      span(aria-current='page') Блог
    h1.blog-page__title Блог нутриціолога
    p.blog-page__lead {{ BLOG_LEAD }}

  .blog-filter(role='group' aria-label='Категорії статей')
    button.blog-filter__chip(type='button' :aria-pressed='active === null' @click='active = null') Усі
    button.blog-filter__chip(
      v-for='c in categories'
      :key='c'
      type='button'
      :aria-pressed='active === c'
      @click='active = active === c ? null : c'
    ) {{ c }}

  TransitionGroup.blog-grid(name='blog-grid' tag='div')
    BlogCard(v-for='a in list' :key='a.slug' :article='a' heading-tag='h2')
AppFooter
ScrollTopButton
</template>
