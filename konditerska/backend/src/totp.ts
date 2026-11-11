import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

// RFC 6238 time-based one-time passwords (Google Authenticator, Authy, 1Password...).
// Implemented with node:crypto only, so no extra dependency is needed.

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
const STEP_MS = 30_000

export function generateSecret(): string {
  const bytes = randomBytes(20)
  let bits = ''
  for (const byte of bytes) bits += byte.toString(2).padStart(8, '0')
  let result = ''
  for (let i = 0; i < bits.length; i += 5) result += ALPHABET[Number.parseInt(bits.slice(i, i + 5), 2)]
  return result
}

function decodeBase32(secret: string): Buffer {
  let bits = ''
  for (const char of secret) {
    const index = ALPHABET.indexOf(char)
    if (index === -1) throw new Error('ADMIN_TOTP_SECRET must be a base32 string (A–Z, 2–7)')
    bits += index.toString(2).padStart(5, '0')
  }
  const bytes: number[] = []
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(Number.parseInt(bits.slice(i, i + 8), 2))
  return Buffer.from(bytes)
}

function codeFor(key: Buffer, counter: number): string {
  const message = Buffer.alloc(8)
  message.writeBigUInt64BE(BigInt(counter))
  const digest = createHmac('sha1', key).update(message).digest()
  const offset = (digest[digest.length - 1] ?? 0) & 0x0f
  const value =
    (((digest[offset] ?? 0) & 0x7f) << 24) |
    (((digest[offset + 1] ?? 0) & 0xff) << 16) |
    (((digest[offset + 2] ?? 0) & 0xff) << 8) |
    ((digest[offset + 3] ?? 0) & 0xff)
  return String(value % 1_000_000).padStart(6, '0')
}

let lastUsedCounter = 0

/** Accepts the current code ±1 step (clock drift). Each code can be used only once. */
export function verifyTotp(secret: string, code: string, now = Date.now()): boolean {
  if (!/^\d{6}$/.test(code)) return false
  const key = decodeBase32(secret)
  const current = Math.floor(now / STEP_MS)
  for (const counter of [current - 1, current, current + 1]) {
    if (counter <= lastUsedCounter) continue
    if (timingSafeEqual(Buffer.from(codeFor(key, counter)), Buffer.from(code))) {
      lastUsedCounter = counter
      return true
    }
  }
  return false
}

export function otpauthUri(secret: string, account: string, issuer: string): string {
  const label = encodeURIComponent(`${issuer}:${account}`)
  return `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`
}
