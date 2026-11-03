<script setup lang="ts">
import BlogCard from './BlogCard.vue'
import { ARTICLE_BY_SLUG, ARTICLES } from '@/content/blog'

// на головній — ключові статті, що відповідають на найчастіші питання
const featured = ['khto-takyi-nutrytsioloh', 'nutrytsioloh-i-diietoloh-riznytsia', 'chomu-diiety-ne-pratsiuiut'].map(
  (slug) => ARTICLE_BY_SLUG[slug]!,
)
const total = ARTICLES.length
</script>

<template lang="pug">
section#blog.section--soft.blog-section
  .container
    .blog-section__head
      div
        .eyebrow(v-reveal='0') Блог
        h2.section-title(v-reveal='100') Корисне про харчування
      RouterLink.btn.btn--outline.blog-section__all(to='/blog' v-reveal='150') Усі статті ({{ total }})
    .blog-grid
      BlogCard(v-for='(a, i) in featured' :key='a.slug' :article='a' v-reveal='i * 100')
</template>
