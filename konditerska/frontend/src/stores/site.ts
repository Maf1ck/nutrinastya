import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { shopApi } from '@/api/shop'
import type { Category, PickupPoint, SiteSettings } from '@/types'

export const useSiteStore = defineStore('site', () => {
  const settings = ref<SiteSettings | null>(null)
  const categories = ref<Category[]>([])
  const pickupPoints = ref<PickupPoint[]>([])
  const loaded = ref(false)
  const error = ref('')

  const pickupCount = computed(() => pickupPoints.value.length)

  /** Replaces {N} and {city} placeholders used in editable texts. */
  function fill(text: string): string {
    return text
      .replaceAll('{N}', String(pickupCount.value))
      .replaceAll('{city}', settings.value?.city ?? '')
  }

  const infoBar = computed(() => {
    if (!settings.value) return ''
    return fill(`${settings.value.infoBarText} · Самовивіз у {N} точках: {city}`)
  })

  async function load(): Promise<void> {
    try {
      const [loadedSettings, loadedCategories, loadedPoints] = await Promise.all([
        shopApi.settings(),
        shopApi.categories(),
        shopApi.pickupPoints(),
      ])
      settings.value = loadedSettings
      categories.value = loadedCategories
      pickupPoints.value = loadedPoints
      error.value = ''
      document.title = `${loadedSettings.brandName} — ${loadedSettings.brandTagline}`
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Не вдалося завантажити дані'
    } finally {
      loaded.value = true
    }
  }

  return { settings, categories, pickupPoints, loaded, error, pickupCount, infoBar, fill, load }
})
