import path from 'node:path'

const rootDir = path.resolve(import.meta.dirname, '..')

export const isProduction = process.env.NODE_ENV === 'production'
/** Running as a Vercel Function: read-only code dir, only /tmp is writable (and not persistent). */
export const onVercel = Boolean(process.env.VERCEL)

export const config = {
  port: Number(process.env.PORT ?? 3001),
  adminUsername: process.env.ADMIN_USERNAME ?? 'admin',
  adminPassword: process.env.ADMIN_PASSWORD ?? 'change-me',
  /** Base32 secret for Google Authenticator / Authy codes. Empty = 2FA disabled (dev only). */
  adminTotpSecret: (process.env.ADMIN_TOTP_SECRET ?? '').replace(/\s/g, '').toUpperCase(),
  allowNoTwoFactor: process.env.ADMIN_ALLOW_NO_2FA === 'true',
  sessionSecret: process.env.SESSION_SECRET ?? 'dev-secret-change-me',
  /** Allowed cross-origin frontend (dev only). Empty = no CORS headers (same-origin production). */
  corsOrigin: process.env.CORS_ORIGIN ?? (isProduction ? '' : 'http://localhost:5173'),
  /**
   * Number of reverse proxies in front of the app (nginx, Caddy, Vercel...).
   * Keep 0 when the app is exposed directly, otherwise client IPs can be spoofed
   * through X-Forwarded-For and rate limits are bypassed.
   */
  trustProxy: Number(process.env.TRUST_PROXY ?? (onVercel ? 1 : 0)),
  telegramToken: process.env.TELEGRAM_BOT_TOKEN ?? '',
  telegramChatId: process.env.TELEGRAM_CHAT_ID ?? '',
  dbPath: process.env.DB_PATH ?? (onVercel ? '/tmp/shop.db' : path.join(rootDir, 'data', 'shop.db')),
  uploadsDir: process.env.UPLOADS_DIR ?? (onVercel ? '/tmp/uploads' : path.join(rootDir, 'uploads')),
  frontendDist: process.env.FRONTEND_DIST ?? path.resolve(rootDir, '..', 'frontend', 'dist'),
  sessionTtlMs: 12 * 60 * 60 * 1000,
}

export const hasWeakSecrets =
  config.adminPassword === 'change-me' ||
  config.adminPassword.length < 12 ||
  config.sessionSecret.startsWith('dev-secret') ||
  config.sessionSecret.length < 24
