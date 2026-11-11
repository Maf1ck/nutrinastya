import type { NextFunction, Request, RequestHandler, Response } from 'express'
import { HttpError } from './http.ts'

interface Bucket {
  count: number
  resetAt: number
}

/**
 * Small in-memory fixed-window limiter (no dependencies).
 * Fine for a single-process shop; use a shared store if you ever scale horizontally.
 */
export function createLimiter(options: {
  windowMs: number
  max: number
  message: string
  /** Bucket key; defaults to the client IP. */
  key?: (req: Request) => string
}) {
  const keyOf = (req: Request) => options.key?.(req) ?? req.ip ?? 'unknown'
  const buckets = new Map<string, Bucket>()

  const sweep = setInterval(() => {
    const now = Date.now()
    for (const [key, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(key)
  }, 60_000)
  sweep.unref()

  function current(key: string): Bucket {
    const now = Date.now()
    const existing = buckets.get(key)
    if (existing && existing.resetAt > now) return existing
    const fresh = { count: 0, resetAt: now + options.windowMs }
    buckets.set(key, fresh)
    return fresh
  }

  /** Counts every request. */
  const hit: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const bucket = current(keyOf(req))
    bucket.count += 1
    if (bucket.count > options.max) {
      res.setHeader('Retry-After', String(Math.ceil((bucket.resetAt - Date.now()) / 1000)))
      next(new HttpError(429, options.message))
      return
    }
    next()
  }

  /** For login: block when over the limit, but only count failures. */
  const guard: RequestHandler = (req, res, next) => {
    const bucket = current(keyOf(req))
    if (bucket.count >= options.max) {
      res.setHeader('Retry-After', String(Math.ceil((bucket.resetAt - Date.now()) / 1000)))
      next(new HttpError(429, options.message))
      return
    }
    next()
  }

  function fail(req: Request): void {
    current(keyOf(req)).count += 1
  }

  function reset(req: Request): void {
    buckets.delete(keyOf(req))
  }

  return { hit, guard, fail, reset }
}
