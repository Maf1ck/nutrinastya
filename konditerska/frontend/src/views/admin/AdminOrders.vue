<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useAdmin } from '@/composables/useAdmin'
import { formatDateTime, formatPickupDate, formatPrice, STATE_LABELS } from '@/composables/useFormat'
import type { AdminOrder, OrderStatus } from '@/types'

const { api, error, run } = useAdmin()

const orders = ref<AdminOrder[]>([])
const filter = ref<OrderStatus | ''>('')

const STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'Нове',
  confirmed: 'Підтверджене',
  ready: 'Готове',
  completed: 'Видане',
  cancelled: 'Скасоване',
}
const statuses = Object.keys(STATUS_LABELS) as OrderStatus[]

async function load(): Promise<void> {
  const result = await run(() => api.orders(filter.value || undefined))
  if (result) orders.value = result
}

async function changeStatus(order: AdminOrder, status: OrderStatus): Promise<void> {
  const ok = await run(() => api.setOrderStatus(order.id, status))
  if (ok) order.status = status
  else await load()
}

function onStatusChange(order: AdminOrder, event: Event): Promise<void> {
  return changeStatus(order, (event.target as HTMLSelectElement).value as OrderStatus)
}

const newCount = computed(() => orders.value.filter((order) => order.status === 'new').length)

// Refresh every 30 seconds so new orders show up without reloading the page.
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  void load()
  timer = setInterval(() => void load(), 30_000)
})
onBeforeUnmount(() => clearInterval(timer))
watch(filter, load)
watch(newCount, (count) => {
  document.title = count ? `(${count}) Нові замовлення` : 'Адмін-панель'
}, { immediate: true })
onBeforeUnmount(() => (document.title = 'Адмін-панель'))
</script>

<template lang="pug">
.adm-row
  h1.adm-h1 Замовлення
  span.adm-badge(v-if="newCount") Нових: {{ newCount }}
  select.adm-select(v-model="filter" aria-label="Фільтр за статусом")
    option(value="") Усі статуси
    option(v-for="status in statuses" :key="status" :value="status") {{ STATUS_LABELS[status] }}
  button.adm-btn.adm-btn--ghost.adm-btn--small(type="button" @click="load") Оновити

p.adm-error(v-if="error" role="alert") {{ error }}
p.adm-muted(v-else-if="!orders.length") Замовлень поки немає.

.adm-orders
  article.adm-order(v-for="order in orders" :key="order.id" :data-status="order.status")
    div
      h2 №{{ order.id }} · {{ order.customerName }}
      p: a(:href="`tel:${order.phone}`") {{ order.phone }}
      p.adm-muted Створено: {{ formatDateTime(order.createdAt) }}
      p(v-if="order.comment") «{{ order.comment }}»
    div
      p: strong {{ order.pickupPoint }}
      p Забрати: {{ formatPickupDate(order.pickupDate) }} о {{ order.pickupTime }}
      ul
        li(v-for="item in order.items" :key="item.id")
          | {{ item.name }} ({{ STATE_LABELS[item.state].toLowerCase() }}) × {{ item.qty }} — {{ formatPrice(item.price * item.qty) }}
      p: strong Разом: {{ formatPrice(order.total) }}
    select.adm-select(
      :value="order.status"
      :aria-label="`Статус замовлення №${order.id}`"
      @change="onStatusChange(order, $event)"
    )
      option(v-for="status in statuses" :key="status" :value="status") {{ STATUS_LABELS[status] }}
</template>
