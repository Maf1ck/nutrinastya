import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { createAdminApi } from '@/api/admin'

const TOKEN_KEY = 'konditerska-admin-token'

function readToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export const useAdminStore = defineStore('admin', () => {
  const token = ref<string | null>(readToken())
  const api = createAdminApi(() => token.value)
  const isLoggedIn = computed(() => token.value !== null)

  async function login(credentials: { username: string; password: string; code: string }): Promise<void> {
    const result = await api.login(credentials)
    token.value = result.token
    try {
      sessionStorage.setItem(TOKEN_KEY, result.token)
    } catch {
      // Session lives in memory only.
    }
  }

  function logout(): void {
    token.value = null
    try {
      sessionStorage.removeItem(TOKEN_KEY)
    } catch {
      // Nothing to clean up.
    }
  }

  return { token, api, isLoggedIn, login, logout }
})
