import type { Directive } from 'vue'

/**
 * Fade-and-rise on scroll: `v-reveal` or `v-reveal="index"` (index adds a small stagger).
 * Styles live in global.scss (`.reveal`). Once the animation ends the helper classes are removed,
 * so the element's own hover/transition styles are not affected. Without IntersectionObserver
 * the element is simply shown.
 */
let observer: IntersectionObserver | null = null

function finish(el: Element): void {
  el.classList.remove('reveal', 'is-visible')
  if (el instanceof HTMLElement) el.style.removeProperty('--reveal-delay')
}

function show(el: Element): void {
  el.classList.add('is-visible')
  const done = () => finish(el)
  el.addEventListener('transitionend', done, { once: true })
  // Fallback in case the transition never fires (hidden tab, display: none ancestor...).
  setTimeout(done, 1800)
}

function getObserver(): IntersectionObserver | null {
  if (typeof IntersectionObserver === 'undefined') return null
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        show(entry.target)
        observer?.unobserve(entry.target)
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
  )
  return observer
}

export const reveal: Directive<HTMLElement, number | undefined> = {
  mounted(el, binding) {
    const io = getObserver()
    if (!io) return

    el.classList.add('reveal')
    el.style.setProperty('--reveal-delay', `${Math.min(binding.value ?? 0, 7) * 70}ms`)
    io.observe(el)
  },
  unmounted(el) {
    observer?.unobserve(el)
  },
}
