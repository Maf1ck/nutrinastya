<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import type { PickupPointInput } from '@/api/admin'
import FormField from '@/components/ui/FormField.vue'
import { useAdmin } from '@/composables/useAdmin'
import type { PickupPoint } from '@/types'

const { api, error, fieldErrors, busy, run } = useAdmin()

const points = ref<PickupPoint[]>([])
const editingId = ref<number | null>(null)
const formOpen = ref(false)

const emptyForm = (): PickupPointInput => ({ name: '', address: '', isActive: true, sortOrder: points.value.length })
const form = reactive<PickupPointInput>(emptyForm())

async function load(): Promise<void> {
  const result = await run(() => api.pickupPoints())
  if (result) points.value = result
}

function startCreate(): void {
  editingId.value = null
  Object.assign(form, emptyForm())
  formOpen.value = true
}

function startEdit(point: PickupPoint): void {
  editingId.value = point.id
  Object.assign(form, {
    name: point.name,
    address: point.address,
    isActive: point.isActive,
    sortOrder: point.sortOrder,
  })
  formOpen.value = true
}

function cancel(): void {
  formOpen.value = false
  editingId.value = null
}

async function save(): Promise<void> {
  const id = editingId.value
  const result = await run(() => (id === null ? api.createPickupPoint({ ...form }) : api.updatePickupPoint(id, { ...form })))
  if (result) {
    points.value = result
    cancel()
  }
}

async function remove(point: PickupPoint): Promise<void> {
  if (!window.confirm(`Видалити точку «${point.name}»? У старих замовленнях адреса збережеться.`)) return
  const result = await run(() => api.deletePickupPoint(point.id))
  if (result) points.value = result
}

onMounted(load)
</script>

<template lang="pug">
.adm-row
  h1.adm-h1 Точки самовивозу
  button.adm-btn(type="button" @click="startCreate") + Додати точку

p.adm-error(v-if="error" role="alert") {{ error }}

form.adm-card(v-if="formOpen" @submit.prevent="save")
  h2.adm-card__title {{ editingId === null ? 'Нова точка' : 'Редагування точки' }}
  .adm-grid
    form-field(label="Назва" :error="fieldErrors.name" v-slot="{ id }")
      input(:id="id" v-model="form.name" type="text" required)
    form-field(label="Адреса" :error="fieldErrors.address" v-slot="{ id }")
      input(:id="id" v-model="form.address" type="text" required)
    form-field(label="Порядок сортування" v-slot="{ id }")
      input(:id="id" v-model.number="form.sortOrder" type="number" step="1")
  .adm-checks
    label
      input(v-model="form.isActive" type="checkbox")
      | Активна (показувати при оформленні)
  .adm-row
    button.adm-btn(type="submit" :disabled="busy") Зберегти
    button.adm-btn.adm-btn--ghost(type="button" @click="cancel") Скасувати

.adm-card
  .adm-table-wrap
    table.adm-table
      thead
        tr
          th Назва
          th Адреса
          th Статус
          th
      tbody
        tr(v-for="point in points" :key="point.id" :class="{ 'is-off': !point.isActive }")
          td: strong {{ point.name }}
          td {{ point.address }}
          td {{ point.isActive ? 'Активна' : 'Прихована' }}
          td
            .adm-row
              button.adm-btn.adm-btn--ghost.adm-btn--small(type="button" @click="startEdit(point)") Змінити
              button.adm-btn.adm-btn--danger.adm-btn--small(type="button" @click="remove(point)") Видалити
</template>
