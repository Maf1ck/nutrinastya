<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import AppFooter from '@/components/AppFooter.vue'
import { LEGAL_DOCS, type LegalKey } from '@/content/legal'
import { legalSeo } from '@/config/seo'

const props = defineProps<{ doc: LegalKey }>()
const page = computed(() => LEGAL_DOCS[props.doc])

watchEffect(() => {
  document.title = legalSeo(props.doc).title
})
</script>

<template lang="pug">
header.legal-header
  .legal-header__inner
    RouterLink.legal-header__back(to='/')
      svg(width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true')
        path(d='m15 18-6-6 6-6')
      | На головну

main.container.legal
  h1.legal__title {{ page.title }}
  p.legal__updated Оновлено: {{ page.updated }}
  p.legal__intro(v-if='page.intro') {{ page.intro }}

  section(v-for='s in page.sections' :key='s.heading')
    h2 {{ s.heading }}
    p(v-for='p in s.paragraphs' :key='p') {{ p }}
    ul(v-if='s.list')
      li(v-for='item in s.list' :key='item') {{ item }}

AppFooter
</template>

<style lang="scss">
@use '@/scss/variables' as *;

.legal-header {
  border-bottom: 1px solid $line;

  &__inner {
    max-width: $container;
    margin: 0 auto;
    padding: 18px 24px;
  }

  &__back {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
    text-decoration: none;
  }
}

.legal {
  max-width: 760px;
  color: $text-nav;

  &__title {
    margin-bottom: 8px;
    color: $text-heading;
    font-size: clamp(32px, 5vw, 44px);
  }

  &__updated {
    margin-bottom: 24px;
    color: $text-muted;
    font-size: 14px;
  }

  &__intro {
    font-size: 17px;
  }

  h2 {
    margin: 32px 0 10px;
    color: $text;
    font-size: 22px;
  }

  p + p,
  p + ul {
    margin-top: 10px;
  }

  ul {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin: 0;
    padding-left: 22px;

    li::marker {
      color: $accent;
    }
  }
}
</style>
