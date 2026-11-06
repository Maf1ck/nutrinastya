<script setup lang="ts">
// Vercel Web Analytics: без cookies, лише знеособлена статистика відвідувань
import { Analytics } from '@vercel/analytics/vue'
import { SpeedInsights } from '@vercel/speed-insights/vue'
</script>

<template>
  <RouterView />
  <Analytics />
  <SpeedInsights />
</template>
