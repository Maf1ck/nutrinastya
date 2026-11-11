import { existsSync } from 'node:fs'
import path from 'node:path'
import express from 'express'
import { config } from './config.ts'
import { errorHandler, notFound } from './http.ts'
import { createLimiter } from './rateLimit.ts'
import { adminRouter } from './routes/admin.ts'
import { publicRouter } from './routes/public.ts'

const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' https://fonts.googleapis.com",
  "font-src https://fonts.gstatic.com",
  "img-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ')

// Generic flood protection for the whole API (per IP).
const apiLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 240,
  message: 'Забагато запитів. Спробуйте за хвилину',
})

export function createApp() {
  const app = express()
  app.disable('x-powered-by')
  app.set('trust proxy', config.trustProxy)

  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'DENY')
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()')
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
    res.setHeader('Content-Security-Policy', CSP)
    next()
  })

  // CORS is only needed when the frontend runs on another origin (dev server).
  if (config.corsOrigin) {
    app.use('/api', (req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', config.corsOrigin)
      res.setHeader('Vary', 'Origin')
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
      if (req.method === 'OPTIONS') {
        res.sendStatus(204)
        return
      }
      next()
    })
  }

  app.use('/api', apiLimiter.hit)

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true })
  })
  app.use('/api/admin', adminRouter)
  app.use('/api', publicRouter)
  app.use('/api', notFound)

  app.use(
    '/uploads',
    express.static(config.uploadsDir, {
      maxAge: '7d',
      index: false,
      dotfiles: 'deny',
      setHeaders: (res) => res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox"),
    }),
  )

  // Production: serve the built frontend and fall back to index.html for SPA routes.
  if (existsSync(path.join(config.frontendDist, 'index.html'))) {
    app.use(express.static(config.frontendDist, { index: false, dotfiles: 'deny' }))
    app.get('/{*splat}', (_req, res) => {
      res.sendFile(path.join(config.frontendDist, 'index.html'))
    })
  }

  app.use(errorHandler)
  return app
}
