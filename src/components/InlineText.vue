<script setup lang="ts">
import { computed } from 'vue'
import { parseInline } from '@/content/blog'

// текст з посиланнями [текст](/шлях) — внутрішні посилання стають RouterLink
const props = defineProps<{ text: string }>()
const parts = computed(() => parseInline(props.text))
</script>

<template lang="pug">
template(v-for='(p, i) in parts' :key='i')
  RouterLink(v-if='p.to' :to='p.to') {{ p.text }}
  template(v-else) {{ p.text }}
</template>
