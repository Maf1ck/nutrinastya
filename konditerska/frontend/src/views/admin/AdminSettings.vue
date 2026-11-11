<script setup lang="ts">
import { onMounted, ref } from 'vue'
import FormField from '@/components/ui/FormField.vue'
import { useAdmin } from '@/composables/useAdmin'
import { useSiteStore } from '@/stores/site'
import type { SiteSettings } from '@/types'

const { api, error, busy, run } = useAdmin()
const site = useSiteStore()

const values = ref<SiteSettings | null>(null)
const saved = ref(false)

interface Field {
  key: keyof SiteSettings
  label: string
  multiline?: boolean
}

const groups: { title: string; hint?: string; fields: Field[] }[] = [
  {
    title: 'Бренд і контакти',
    fields: [
      { key: 'brandName', label: 'Назва (у шапці й футері)' },
      { key: 'brandTagline', label: 'Підпис під назвою' },
      { key: 'city', label: 'Місто' },
      { key: 'phone', label: 'Телефон' },
      { key: 'instagram', label: 'Instagram (@акаунт)' },
      { key: 'infoBarText', label: 'Текст у верхній смузі (далі автоматично: «Самовивіз у N точках: місто»)' },
    ],
  },
  {
    title: 'Головний екран',
    fields: [
      { key: 'heroEyebrow', label: 'Надзаголовок (далі автоматично: «· місто»)' },
      { key: 'heroTitle', label: 'Заголовок' },
      { key: 'heroText', label: 'Текст', multiline: true },
    ],
  },
  {
    title: 'Інформаційні картки',
    hint: 'У текстах можна використовувати {N} (кількість точок самовивозу) та {city} (місто).',
    fields: [
      { key: 'infoCard1Title', label: 'Картка 1 — заголовок' },
      { key: 'infoCard1Text', label: 'Картка 1 — текст', multiline: true },
      { key: 'infoCard2Title', label: 'Картка 2 — заголовок' },
      { key: 'infoCard2Text', label: 'Картка 2 — текст', multiline: true },
      { key: 'infoCard3Title', label: 'Картка 3 — заголовок' },
      { key: 'infoCard3Text', label: 'Картка 3 — текст', multiline: true },
    ],
  },
  {
    title: 'Інше',
    fields: [
      { key: 'footerAbout', label: 'Опис у футері', multiline: true },
      { key: 'orderNote', label: 'Примітка під кнопкою «Підтвердити замовлення»', multiline: true },
    ],
  },
]

async function load(): Promise<void> {
  const result = await run(() => api.settings())
  if (result) values.value = result
}

async function save(): Promise<void> {
  if (!values.value) return
  saved.value = false
  const result = await run(() => api.saveSettings({ ...values.value }))
  if (result) {
    values.value = result
    saved.value = true
    await site.load()
  }
}

onMounted(load)
</script>

<template lang="pug">
h1.adm-h1 Тексти сайту

p.adm-error(v-if="error" role="alert") {{ error }}

form(v-if="values" @submit.prevent="save")
  .adm-main
    section.adm-card(v-for="group in groups" :key="group.title")
      h2.adm-card__title {{ group.title }}
      p.adm-muted(v-if="group.hint") {{ group.hint }}
      .adm-grid
        form-field(
          v-for="field in group.fields"
          :key="field.key"
          :label="field.label"
          :class="{ 'adm-wide': field.multiline }"
          v-slot="{ id }"
        )
          textarea(v-if="field.multiline" :id="id" v-model="values[field.key]" rows="3")
          input(v-else :id="id" v-model="values[field.key]" type="text")
    .adm-row
      button.adm-btn(type="submit" :disabled="busy") Зберегти
      span.adm-muted(v-if="saved" role="status") Збережено ✓
</template>
