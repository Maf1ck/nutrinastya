<script setup lang="ts">
import { computed } from 'vue'
import { articlePath, readingMinutes, type Article } from '@/content/blog'

const props = defineProps<{ article: Article; headingTag?: 'h2' | 'h3' }>()
const minutes = computed(() => readingMinutes(props.article))
</script>

<template lang="pug">
article.blog-card
  RouterLink.blog-card__link(:to='articlePath(article.slug)')
    span.blog-card__cat {{ article.category }}
    component.blog-card__title(:is="headingTag ?? 'h3'") {{ article.title }}
    p.blog-card__excerpt {{ article.excerpt }}
    span.blog-card__meta
      | {{ minutes }} хв читання
      span.blog-card__arrow(aria-hidden='true') →
</template>
