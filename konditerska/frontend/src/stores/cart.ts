import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import type { CartLine, Product, ProductState } from '@/types'

const STORAGE_KEY = 'konditerska-cart'
const MAX_QTY = 99

function readStored(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    if (!Array.isArray(parsed)) return []
    // The cart lives in localStorage and can be edited by the user: keep only well-formed lines.
    return (parsed as Partial<CartLine>[]).filter(
      (line): line is CartLine =>
        Number.isInteger(line.productId) &&
        (line.state === 'fresh' || line.state === 'frozen') &&
        Number.isInteger(line.qty) &&
        (line.qty ?? 0) > 0 &&
        (line.qty ?? 0) <= MAX_QTY &&
        typeof line.name === 'string' &&
        typeof line.price === 'number' &&
        typeof line.weightLabel === 'string' &&
        typeof line.imageUrl === 'string' &&
        (/^\/(uploads|demo)\/[\w.-]+$/.test(line.imageUrl) || /^https:\/\//.test(line.imageUrl) || line.imageUrl === ''),
    )
  } catch {
    return []
  }
}

/** The state a product is added in by default (fresh when available). */
export function defaultState(product: Pick<Product, 'hasFresh' | 'hasFrozen'>): ProductState {
  return product.hasFresh ? 'fresh' : 'frozen'
}

export const useCartStore = defineStore('cart', () => {
  const lines = ref<CartLine[]>(readStored())

  watch(
    lines,
    (value) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
      } catch {
        // Storage can be unavailable (private mode) — the cart then lives in memory only.
      }
    },
    { deep: true },
  )

  const lineCount = computed(() => lines.value.length)
  const totalQty = computed(() => lines.value.reduce((sum, line) => sum + line.qty, 0))
  const total = computed(() => lines.value.reduce((sum, line) => sum + line.price * line.qty, 0))

  function find(productId: number, state: ProductState): CartLine | undefined {
    return lines.value.find((line) => line.productId === productId && line.state === state)
  }

  function add(product: Product, state: ProductState = defaultState(product)): void {
    const existing = find(product.id, state)
    if (existing) {
      existing.qty = Math.min(MAX_QTY, existing.qty + 1)
      return
    }
    lines.value.push({
      productId: product.id,
      state,
      qty: 1,
      name: product.name,
      price: product.price,
      weightLabel: product.weightLabel,
      imageUrl: product.imageUrl,
      hasFresh: product.hasFresh,
      hasFrozen: product.hasFrozen,
    })
  }

  function setQty(line: CartLine, qty: number): void {
    if (qty <= 0) {
      remove(line)
      return
    }
    line.qty = Math.min(MAX_QTY, qty)
  }

  function remove(line: CartLine): void {
    lines.value = lines.value.filter((item) => item !== line)
  }

  /** Switches fresh/frozen; merges with an existing line of the target state. */
  function setState(line: CartLine, state: ProductState): void {
    if (line.state === state) return
    const target = find(line.productId, state)
    if (target) {
      target.qty = Math.min(MAX_QTY, target.qty + line.qty)
      remove(line)
      return
    }
    line.state = state
  }

  function clear(): void {
    lines.value = []
  }

  /** Refreshes prices and availability from the catalog; drops products that no longer exist. */
  function sync(products: Product[]): void {
    const byId = new Map(products.map((product) => [product.id, product]))
    const next: CartLine[] = []
    for (const line of lines.value) {
      const product = byId.get(line.productId)
      if (!product) continue
      const state = line.state === 'fresh' ? (product.hasFresh ? 'fresh' : 'frozen') : product.hasFrozen ? 'frozen' : 'fresh'
      const merged = next.find((item) => item.productId === line.productId && item.state === state)
      if (merged) {
        merged.qty = Math.min(MAX_QTY, merged.qty + line.qty)
        continue
      }
      next.push({
        ...line,
        state,
        name: product.name,
        price: product.price,
        weightLabel: product.weightLabel,
        imageUrl: product.imageUrl,
        hasFresh: product.hasFresh,
        hasFrozen: product.hasFrozen,
      })
    }
    lines.value = next
  }

  return { lines, lineCount, totalQty, total, add, setQty, remove, setState, clear, sync }
})
