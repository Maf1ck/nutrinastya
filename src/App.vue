<script setup lang="ts">
// Vercel Web Analytics: без cookies, лише знеособлена статистика відвідувань
import { Analytics } from '@vercel/analytics/vue'
</script>

<template>
  <RouterView />
  <Analytics />
</template>
