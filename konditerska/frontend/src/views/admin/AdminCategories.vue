<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import type { CategoryInput } from '@/api/admin'
import FormField from '@/components/ui/FormField.vue'
import { readFileAsDataUrl, useAdmin } from '@/composables/useAdmin'
import type { Category } from '@/types'

const { api, error, fieldErrors, busy, run } = useAdmin()

const categories = ref<Category[]>([])
const editingId = ref<number | null>(null)
const formOpen = ref(false)

const emptyForm = (): CategoryInput => ({
  name: '',
  slug: '',
  tileTone: 1,
  sortOrder: categories.value.length,
  description: '',
  imageUrl: '',
})
const form = reactive<CategoryInput>(emptyForm())

const TRANSLIT: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'h', ґ: 'g', д: 'd', е: 'e', є: 'ie', ж: 'zh', з: 'z', и: 'y', і: 'i', ї: 'i',
  й: 'i', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh',
  ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch', ю: 'iu', я: 'ia', ь: '',
}

function slugify(name: string): string {
  return [...name.toLowerCase()]
    .map((char) => TRANSLIT[char] ?? char)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function onNameInput(): void {
  if (editingId.value === null) form.slug = slugify(form.name)
}

async function load(): Promise<void> {
  const result = await run(() => api.categories())
  if (result) categories.value = result
}

function startCreate(): void {
  editingId.value = null
  Object.assign(form, emptyForm())
  formOpen.value = true
}

function startEdit(category: Category): void {
  editingId.value = category.id
  Object.assign(form, {
    name: category.name,
    slug: category.slug,
    tileTone: category.tileTone,
    sortOrder: category.sortOrder,
    description: category.description,
    imageUrl: category.imageUrl,
  })
  formOpen.value = true
}

function cancel(): void {
  formOpen.value = false
  editingId.value = null
}

async function save(): Promise<void> {
  const id = editingId.value
  const result = await run(() => (id === null ? api.createCategory({ ...form }) : api.updateCategory(id, { ...form })))
  if (result) {
    categories.value = result
    cancel()
  }
}

async function remove(category: Category): Promise<void> {
  if (!window.confirm(`Видалити категорію «${category.name}»?`)) return
  const result = await run(() => api.deleteCategory(category.id))
  if (result) categories.value = result
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
  h1.adm-h1 Категорії
  button.adm-btn(type="button" @click="startCreate") + Додати категорію

p.adm-error(v-if="error" role="alert") {{ error }}

form.adm-card(v-if="formOpen" @submit.prevent="save")
  h2.adm-card__title {{ editingId === null ? 'Нова категорія' : 'Редагування категорії' }}
  .adm-grid
    form-field(label="Назва" :error="fieldErrors.name" v-slot="{ id }")
      input(:id="id" v-model="form.name" type="text" required @input="onNameInput")
    form-field(label="Адреса (slug, латиницею)" :error="fieldErrors.slug" v-slot="{ id }")
      input(:id="id" v-model="form.slug" type="text" required)
    form-field(label="Колір плитки (1–4)" v-slot="{ id }")
      select(:id="id" v-model.number="form.tileTone")
        option(:value="1") 1 — пісочний
        option(:value="2") 2 — шавлієвий
        option(:value="3") 3 — рожевий
        option(:value="4") 4 — світло-зелений
    form-field.adm-wide(label="Короткий опис (показується на плитці, до 120 символів)" :error="fieldErrors.description" v-slot="{ id }")
      input(:id="id" v-model="form.description" type="text" maxlength="120")
    form-field(label="Порядок сортування" v-slot="{ id }")
      input(:id="id" v-model.number="form.sortOrder" type="number" step="1")
    form-field(label="Фото плитки (якщо не вказати — візьметься фото першого товару)" :error="fieldErrors.imageUrl" v-slot="{ id }")
      input(:id="id" type="file" accept="image/png,image/jpeg,image/webp" @change="onFile")
    form-field(label="…або посилання на фото (https://…)" :error="fieldErrors.imageUrl" v-slot="{ id }")
      input(:id="id" v-model.trim="form.imageUrl" type="url" placeholder="https://")
  .adm-row(v-if="form.imageUrl")
    img.adm-preview(:src="form.imageUrl" alt="Попередній перегляд")
    button.adm-btn.adm-btn--ghost.adm-btn--small(type="button" @click="form.imageUrl = ''") Прибрати фото
  .adm-row
    button.adm-btn(type="submit" :disabled="busy") Зберегти
    button.adm-btn.adm-btn--ghost(type="button" @click="cancel") Скасувати

.adm-card
  .adm-table-wrap
    table.adm-table
      thead
        tr
          th №
          th Назва
          th Slug
          th Товарів
          th
      tbody
        tr(v-for="(category, index) in categories" :key="category.id")
          td {{ index + 1 }}
          td: strong {{ category.name }}
          td {{ category.slug }}
          td {{ category.productCount }}
          td
            .adm-row
              button.adm-btn.adm-btn--ghost.adm-btn--small(type="button" @click="startEdit(category)") Змінити
              button.adm-btn.adm-btn--danger.adm-btn--small(type="button" @click="remove(category)") Видалити
</template>
