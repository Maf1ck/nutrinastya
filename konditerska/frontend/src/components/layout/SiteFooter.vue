<script setup lang="ts">
import { computed } from 'vue'
import AppLogo from '@/components/ui/AppLogo.vue'
import { useSiteStore } from '@/stores/site'

const site = useSiteStore()

const year = new Date().getFullYear()
const catalogLinks = computed(() => site.categories.slice(0, 4))

const instagramHandle = computed(() => site.settings?.instagram.replace(/^@/, '') ?? '')
const instagramHref = computed(() =>
  /^[\w.]+$/.test(instagramHandle.value) ? `https://instagram.com/${instagramHandle.value}` : undefined,
)
</script>

<template lang="pug">
footer.footer
  .container
    .footer__columns
      .footer__about
        app-logo(light)
        p.footer__about-text {{ site.settings?.footerAbout }}
      nav.footer__col(aria-label="Каталог")
        h2.footer__heading Каталог
        router-link.footer__link(
          v-for="category in catalogLinks"
          :key="category.id"
          :to="{ name: 'category', params: { slug: category.slug } }"
        ) {{ category.name }}
      nav.footer__col.footer__col--info(aria-label="Інформація")
        h2.footer__heading Інформація
        router-link.footer__link(:to="{ name: 'home', hash: '#how' }") Як замовити
        router-link.footer__link(:to="{ name: 'home', hash: '#how' }") Свіже та заморожене
        router-link.footer__link(:to="{ name: 'home', hash: '#how' }") Адреси самовивозу
      .footer__col
        h2.footer__heading Контакти
        p.footer__text {{ site.settings?.phone }}
        p.footer__text
          | Instagram:&nbsp;
          a.footer__link(v-if="instagramHref" :href="instagramHref" target="_blank" rel="noopener") {{ site.settings?.instagram }}
          template(v-else) {{ site.settings?.instagram }}
        p.footer__text {{ site.settings?.city }}
    p.footer__copy © {{ year }} {{ site.settings?.brandName }} · Кондитерська
</template>

<style lang="scss" scoped>
.footer {
  padding-block: $s-48 $s-32;
  background: $c-ink-dark;
  color: $c-bg;
  @include up($bp-md) {
    padding-block: $s-64 $s-40;
  }

  &__columns {
    display: grid;
    gap: $s-32;
    @include up($bp-md) {
      grid-template-columns: repeat(2, 1fr);
    }
    @include up($bp-lg) {
      grid-template-columns: 1.6fr repeat(3, 1fr);
      gap: $s-24;
    }
  }

  &__about {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: $s-16;
  }

  &__about-text {
    max-width: 320px;
    color: $c-on-dark;
    font-size: 15px;
    line-height: 24px;
  }

  &__col {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: $s-12;

    &--info {
      display: none;
      @include up($bp-md) {
        display: flex;
      }
    }
  }

  &__heading {
    @include eyebrow(14px, 0.1em);
    color: $c-accent;
    font-weight: 700;
  }

  &__text,
  &__link {
    font-size: 15px;
  }

  &__link {
    @include hover-only {
      color: $c-accent;
    }
  }

  &__copy {
    margin-top: $s-40;
    color: $c-on-dark-muted;
    font-size: 13px;
  }
}
</style>
