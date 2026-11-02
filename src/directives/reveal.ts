import type { Directive } from 'vue'

// Плавна поява елемента під час скролу. Значення директиви — затримка в мс.
const DURATION = 800

const observer =
  typeof IntersectionObserver !== 'undefined'
    ? new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue
            const el = entry.target as HTMLElement
            observer?.unobserve(el)
            el.classList.add('is-visible')
            // після появи прибираємо службові класи, щоб не заважати hover-анімаціям
            const delay = parseInt(el.style.getPropertyValue('--reveal-delay')) || 0
            setTimeout(() => {
              el.classList.remove('reveal', 'is-visible')
              el.style.removeProperty('--reveal-delay')
            }, delay + DURATION)
          }
        },
        { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
      )
    : null

export const vReveal: Directive<HTMLElement, number | undefined> = {
  mounted(el, { value }) {
    if (!observer) return
    el.classList.add('reveal')
    if (value) el.style.setProperty('--reveal-delay', `${value}ms`)
    observer.observe(el)
  },
  unmounted(el) {
    observer?.unobserve(el)
  },
}

declare module 'vue' {
  interface GlobalDirectives {
    vReveal: typeof vReveal
  }
}
