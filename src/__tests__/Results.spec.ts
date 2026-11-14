import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { RESULTS } from '@/content/results'

describe('відгуки клієнтів', () => {
  it('кожен відгук має скриншот у public/reviews, без дублікатів', () => {
    const files = RESULTS.map((r) => r.file)
    expect(new Set(files).size).toBe(files.length)
    for (const file of files) expect(existsSync(`public/reviews/${file}`)).toBe(true)
  })

  it('у кожного є ім’я, запит і хоча б одна метрика', () => {
    for (const r of RESULTS) {
      expect(r.name).not.toBe('')
      expect(r.request).not.toBe('')
      expect(r.metrics.length).toBeGreaterThan(0)
    }
  })

  it('оцінок (зірок) немає: їх ніхто не ставив', () => {
    expect(Object.keys(RESULTS[0]!)).not.toContain('rating')
  })
})
