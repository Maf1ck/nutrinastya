import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import type { NextFunction, Request, Response } from 'express'
import { config } from './config.ts'
import { HttpError } from './http.ts'
import { createLimiter } from './rateLimit.ts'

function sign(payload: string): string {
  return createHmac('sha256', config.sessionSecret).update(payload).digest('base64url')
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && timingSafeEqual(left, right)
}

/** Compares SHA-256 digests so the check takes the same time for any input length. */
const sameSecret = (input: string, expected: string): boolean => {
  const digest = (value: string) => createHash('sha256').update(value).digest()
  return timingSafeEqual(digest(input), digest(expected))
}

export const checkPassword = (password: string) => sameSecret(password, config.adminPassword)
export const checkUsername = (username: string) => sameSecret(username.trim().toLowerCase(), config.adminUsername.toLowerCase())

export function createToken(): string {
  const payload = String(Date.now() + config.sessionTtlMs)
  return `${payload}.${sign(payload)}`
}

function verifyToken(token: string): boolean {
  const [payload, signature, extra] = token.split('.')
  if (!payload || !signature || extra !== undefined) return false
  if (!safeEqual(signature, sign(payload))) return false
  return Number(payload) > Date.now()
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token || !verifyToken(token)) {
    next(new HttpError(401, 'Потрібен вхід в адмін-панель'))
    return
  }
  next()
}

/**
 * Failed logins are limited twice: per IP, and globally for the whole site. The global limit stops
 * distributed attacks from many IPs (botnets) — they share one budget. Successful logins do not count.
 */
export const globalLoginLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: 'Вхід тимчасово заблоковано через підозрілу активність. Спробуйте за 15 хвилин',
  key: () => 'global',
})

/** 8 failed attempts per 15 minutes per IP. */
export const loginLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 8,
  message: 'Забагато невдалих спроб входу. Спробуйте за 15 хвилин',
})
