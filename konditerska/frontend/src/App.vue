<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import SiteFooter from '@/components/layout/SiteFooter.vue'
import SiteHeader from '@/components/layout/SiteHeader.vue'
import { useSiteStore } from '@/stores/site'

const site = useSiteStore()
const route = useRoute()
const isAdmin = computed(() => route.matched.some((record) => record.meta.admin))

onMounted(() => site.load())
</script>

<template lang="pug">
router-view(v-if="isAdmin")
template(v-else)
  a.skip-link(href="#main") Перейти до вмісту
  site-header
  main#main.main
    p.load-error(v-if="site.loaded && site.error" role="alert") {{ site.error }}
    router-view(v-else-if="site.loaded" v-slot="{ Component, route: current }")
      transition(name="page" mode="out-in")
        component(:is="Component" :key="current.path")
  site-footer(v-if="site.loaded && !site.error")
</template>

<style lang="scss" scoped>
.main {
  min-height: 50vh;
}

.skip-link {
  position: absolute;
  left: $s-16;
  top: -100px;
  z-index: 100;
  padding: $s-12 $s-20;
  border-radius: $r-pill;
  background: $c-ink-dark;
  color: $c-bg;

  &:focus {
    top: $s-8;
  }
}

.load-error {
  padding: $s-96 var(--gutter);
  text-align: center;
  color: $c-danger;
}
</style>
