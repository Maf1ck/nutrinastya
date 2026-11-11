<script setup lang="ts">
import { onMounted, ref } from 'vue'
import FormField from '@/components/ui/FormField.vue'
import { useAdmin } from '@/composables/useAdmin'
import { useAdminStore } from '@/stores/admin'
import '@/styles/admin.scss'

const admin = useAdminStore()
const { error, busy, run } = useAdmin()

const username = ref('')
const password = ref('')
const code = ref('')
const needsCode = ref(false)

async function login(): Promise<void> {
  await run(() => admin.login({ username: username.value, password: password.value, code: code.value }))
  password.value = ''
  code.value = ''
}

onMounted(async () => {
  document.title = 'Адмін-панель'
  // The panel must never appear in search results.
  const robots = document.createElement('meta')
  robots.name = 'robots'
  robots.content = 'noindex, nofollow'
  document.head.appendChild(robots)

  try {
    needsCode.value = (await admin.api.loginInfo()).totp
  } catch {
    needsCode.value = false
  }
})
</script>

<template lang="pug">
.adm
  .adm-login(v-if="!admin.isLoggedIn")
    form(@submit.prevent="login")
      h1.adm-h1 Вхід
      form-field(label="Логін" v-slot="{ id }")
        input(:id="id" v-model="username" type="text" autocomplete="username" required)
      form-field(label="Пароль" v-slot="{ id }")
        input(:id="id" v-model="password" type="password" autocomplete="current-password" required)
      form-field(v-if="needsCode" label="Код з Google Authenticator" v-slot="{ id }")
        input(:id="id" v-model="code" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="6 цифр" required)
      p.adm-error(v-if="error" role="alert") {{ error }}
      button.adm-btn(type="submit" :disabled="busy || !password || !username") Увійти
  template(v-else)
    header.adm-bar
      .adm-bar__inner.container
        span.adm-brand Адмін-панель
        nav.adm-nav(aria-label="Розділи адмін-панелі")
          router-link(:to="{ name: 'admin-orders' }") Замовлення
          router-link(:to="{ name: 'admin-products' }") Товари
          router-link(:to="{ name: 'admin-categories' }") Категорії
          router-link(:to="{ name: 'admin-pickup' }") Точки самовивозу
          router-link(:to="{ name: 'admin-settings' }") Тексти сайту
        router-link(:to="{ name: 'home' }" target="_blank") На сайт ↗
        button.adm-btn.adm-btn--ghost.adm-btn--small(type="button" @click="admin.logout()") Вийти
    main.adm-main.container
      router-view
</template>
