import { ref } from 'vue'
import { ApiError } from '@/api/client'
import { useAdminStore } from '@/stores/admin'

/** Wraps admin API calls: tracks busy/error state and signs out on an expired session. */
export function useAdmin() {
  const admin = useAdminStore()
  const error = ref('')
  const fieldErrors = ref<Record<string, string>>({})
  const busy = ref(false)

  async function run<T>(action: () => Promise<T>): Promise<T | undefined> {
    busy.value = true
    error.value = ''
    fieldErrors.value = {}
    try {
      return await action()
    } catch (cause) {
      if (cause instanceof ApiError) {
        if (cause.status === 401) admin.logout()
        error.value = cause.message
        fieldErrors.value = cause.fields
      } else {
        error.value = 'Щось пішло не так'
      }
      return undefined
    } finally {
      busy.value = false
    }
  }

  return { api: admin.api, error, fieldErrors, busy, run }
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Не вдалося прочитати файл'))
    reader.readAsDataURL(file)
  })
}
