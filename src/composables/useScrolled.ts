import { onBeforeUnmount, onMounted, ref } from 'vue'

// true, коли сторінку прокручено далі ніж на `offset` пікселів
export function useScrolled(offset = 0) {
  const scrolled = ref(false)
  const update = () => {
    scrolled.value = window.scrollY > offset
  }

  onMounted(() => {
    update()
    window.addEventListener('scroll', update, { passive: true })
  })
  onBeforeUnmount(() => window.removeEventListener('scroll', update))

  return scrolled
}
