<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import type { ProductInput } from '@/api/admin'
import FormField from '@/components/ui/FormField.vue'
import { readFileAsDataUrl, useAdmin } from '@/composables/useAdmin'
import { formatPrice } from '@/composables/useFormat'
import type { Category, Product } from '@/types'

const { api, error, fieldErrors, busy, run } = useAdmin()

const products = ref<Product[]>([])
const categories = ref<Category[]>([])
const editingId = ref<number | null>(null)
const formOpen = ref(false)

function emptyForm(): ProductInput {
  return {
    categoryId: categories.value[0]?.id ?? 0,
    name: '',
    description: '',
    weightLabel: '',
    price: 0,
    imageUrl: '',
    hasFresh: true,
    hasFrozen: true,
    isPopular: false,
    isActive: true,
    sortOrder: 0,
  }
}

const form = reactive<ProductInput>(emptyForm())

async function load(): Promise<void> {
  const [loadedProducts, loadedCategories] = await Promise.all([
    run(() => api.products()),
    run(() => api.categories()),
  ])
  if (loadedProducts) products.value = loadedProducts
  if (loadedCategories) categories.value = loadedCategories
}

function categoryName(id: number): string {
  return categories.value.find((category) => category.id === id)?.name ?? '—'
}

function startCreate(): void {
  editingId.value = null
  Object.assign(form, emptyForm())
  formOpen.value = true
}

function startEdit(product: Product): void {
  editingId.value = product.id
  const { id: _id, categorySlug: _slug, ...rest } = product
  Object.assign(form, rest)
  formOpen.value = true
}

function cancel(): void {
  formOpen.value = false
  editingId.value = null
}

async function save(): Promise<void> {
  const id = editingId.value
  const result = await run(() => (id === null ? api.createProduct({ ...form }) : api.updateProduct(id, { ...form })))
  if (result) {
    products.value = result
    cancel()
  }
}

async function remove(product: Product): Promise<void> {
  if (!window.confirm(`Видалити «${product.name}»? Дію не можна скасувати.`)) return
  const result = await run(() => api.deleteProduct(product.id))
  if (result) products.value = result
}

async function toggleActive(product: Product): Promise<void> {
  const { id, categorySlug: _slug, ...rest } = product
  const result = await run(() => api.updateProduct(id, { ...rest, isActive: !product.isActive }))
  if (result) products.value = result
}

async function onFile(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const dataUrl = await readFileAsDataUrl(file)
  const uploaded = await run(() => api.uploadImage(dataUrl))
  if (uploaded) form.imageUrl = uploaded.url
  input.value = ''
}

onMounted(load)
</script>

<template lang="pug">
.adm-row
  h1.adm-h1 Товари
  button.adm-btn(type="button" @click="startCreate") + Додати товар

p.adm-error(v-if="error" role="alert") {{ error }}

form.adm-card(v-if="formOpen" @submit.prevent="save")
  h2.adm-card__title {{ editingId === null ? 'Новий товар' : 'Редагування товару' }}
  .adm-grid
    form-field(label="Назва" :error="fieldErrors.name" v-slot="{ id }")
      input(:id="id" v-model="form.name" type="text" required)
    form-field(label="Категорія" :error="fieldErrors.categoryId" v-slot="{ id }")
      select(:id="id" v-model.number="form.categoryId" required)
        option(v-for="category in categories" :key="category.id" :value="category.id") {{ category.name }}
    form-field(label="Вага / кількість (напр. «1,2 кг» або «6 шт»)" v-slot="{ id }")
      input(:id="id" v-model="form.weightLabel" type="text")
    form-field(label="Ціна, ₴" :error="fieldErrors.price" v-slot="{ id }")
      input(:id="id" v-model.number="form.price" type="number" min="0" step="1" required)
    form-field.adm-wide(label="Опис (необов’язково)" v-slot="{ id }")
      textarea(:id="id" v-model="form.description")
    form-field(label="Порядок сортування" v-slot="{ id }")
      input(:id="id" v-model.number="form.sortOrder" type="number" step="1")
    form-field(label="Фото" v-slot="{ id }")
      input(:id="id" type="file" accept="image/png,image/jpeg,image/webp" @change="onFile")
  img.adm-preview(v-if="form.imageUrl" :src="form.imageUrl" alt="Попередній перегляд")
  .adm-checks
    label
      input(v-model="form.hasFresh" type="checkbox")
      | Є свіжий
    label
      input(v-model="form.hasFrozen" type="checkbox")
      | Є заморожений
    label
      input(v-model="form.isPopular" type="checkbox")
      | Показувати в «Популярне»
    label
      input(v-model="form.isActive" type="checkbox")
      | Показувати на сайті
  p.adm-error(v-if="fieldErrors.hasFresh" role="alert") {{ fieldErrors.hasFresh }}
  .adm-row
    button.adm-btn(type="submit" :disabled="busy") Зберегти
    button.adm-btn.adm-btn--ghost(type="button" @click="cancel") Скасувати

.adm-card
  .adm-table-wrap
    table.adm-table
      thead
        tr
          th Фото
          th Назва
          th Категорія
          th Ціна
          th Стани
          th
          th
      tbody
        tr(v-for="product in products" :key="product.id" :class="{ 'is-off': !product.isActive }")
          td: img(v-if="product.imageUrl" :src="product.imageUrl" alt="")
          td
            strong {{ product.name }}
            br
            span.adm-muted {{ product.weightLabel }}
            |
            span.adm-muted(v-if="product.isPopular") · популярне
          td {{ categoryName(product.categoryId) }}
          td {{ formatPrice(product.price) }}
          td {{ [product.hasFresh && 'свіжий', product.hasFrozen && 'заморожений'].filter(Boolean).join(', ') }}
          td
            button.adm-btn.adm-btn--ghost.adm-btn--small(type="button" @click="toggleActive(product)")
              | {{ product.isActive ? 'Сховати' : 'Показати' }}
          td
            .adm-row
              button.adm-btn.adm-btn--ghost.adm-btn--small(type="button" @click="startEdit(product)") Змінити
              button.adm-btn.adm-btn--danger.adm-btn--small(type="button" @click="remove(product)") Видалити
</template>
