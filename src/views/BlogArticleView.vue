<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import BlogCard from '@/components/BlogCard.vue'
import InlineText from '@/components/InlineText.vue'
import AppFooter from '@/components/AppFooter.vue'
import ScrollTopButton from '@/components/ScrollTopButton.vue'
import { ARTICLE_BY_SLUG, formatDate, readingMinutes, relatedArticles } from '@/content/blog'
import { articleSeo } from '@/config/seo'
import { CONTACTS, OWNER } from '@/config/site'

// неіснуючі slug відсікає роутер (beforeEnter); перевірка тут — на час переходу між маршрутами
const props = defineProps<{ slug: string }>()
const article = computed(() => ARTICLE_BY_SLUG[props.slug])
const related = computed(() => (article.value ? relatedArticles(article.value) : []))

watchEffect(() => {
  if (article.value) document.title = articleSeo(props.slug).title
})
</script>

<template lang="pug">
PageHeader
main.container.article(v-if='article')
  nav.breadcrumbs(aria-label='Навігаційний ланцюжок')
    RouterLink(to='/') Головна
    span(aria-hidden='true')  /
    RouterLink(to='/blog') Блог
    span(aria-hidden='true')  /
    span(aria-current='page') {{ article.category }}

  article
    header.article__header
      span.article__cat {{ article.category }}
      h1.article__title {{ article.title }}
      p.article__meta
        span {{ OWNER.name }}, нутриціолог
        span ·
        time(:datetime='article.published') {{ formatDate(article.published) }}
        span ·
        span {{ readingMinutes(article) }} хв читання

    p.article__lead {{ article.lead }}

    aside.article__takeaways-box(aria-label='Головне')
      .article__takeaways-title Головне зі статті
      ul.article__takeaways
        li(v-for='t in article.takeaways' :key='t') {{ t }}

    .article__body
      section(v-for='s in article.sections' :key='s.heading')
        h2 {{ s.heading }}
        p(v-for='p in s.paragraphs' :key='p')
          InlineText(:text='p')
        ul(v-if='s.list')
          li(v-for='item in s.list' :key='item')
            InlineText(:text='item')
        p.article__tip(v-if='s.tip')
          InlineText(:text='s.tip')

    section.article-faq(v-if='article.faq?.length' aria-labelledby='article-faq-title')
      h2#article-faq-title.article-faq__title Часті питання
      details.article-faq__item(v-for='f in article.faq' :key='f.q')
        summary {{ f.q }}
        p {{ f.a }}

    p.article__disclaimer
      | Стаття має ознайомчий характер і не замінює консультації лікаря. Детальніше — у розділі #[RouterLink(to='/disclaimer') «Відмова від відповідальності»].

  .article-cta
    .article-cta__text
      h2.article-cta__title Хочете план харчування саме під вас?
      p Розберемо ваш раціон, звички та цілі на онлайн-консультації — без жорстких дієт і заборон.
    a.btn.btn--white.btn--lg(:href='CONTACTS.telegram' target='_blank' rel='noopener') Записатися на консультацію

  section.article-related(aria-labelledby='related-title')
    h2#related-title.article-related__title Читайте також
    .blog-grid
      BlogCard(v-for='a in related' :key='a.slug' :article='a')
AppFooter
ScrollTopButton
</template>
