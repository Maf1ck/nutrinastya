# Шаблон сайту для кондитерської

Інтернет-вітрина з каталогом, кошиком і замовленням на **самовивіз** (оплата при отриманні) + адмін-панель.
Дизайн: Figma «Imaginarium — шаблон для кондитерів» (десктоп 1440 і мобільна 390).

- `frontend/` — Vue 3 (`<script setup lang="ts">`, Pug, SCSS), Pinia, Vue Router, Vite
- `backend/` — Node 22 + Express 5 + TypeScript, SQLite (вбудований `node:sqlite`), zod

## Запуск

```bash
pnpm install
cp backend/.env.example backend/.env   # змініть ADMIN_PASSWORD і SESSION_SECRET
pnpm dev                               # фронт: http://localhost:5173, API: http://localhost:3001
```

Адмінка: `/admin` (пароль із `ADMIN_PASSWORD`). При першому запуску БД заповнюється демо-даними
(8 категорій, 16 товарів, 3 точки самовивозу) — їх можна видалити/змінити в адмінці.

## Продакшн

```bash
pnpm build                              # type-check + збірка фронтенду в frontend/dist
NODE_ENV=production ADMIN_PASSWORD=... SESSION_SECRET=... pnpm --filter konditerska-backend start
```

Бекенд сам віддає `frontend/dist` та `/uploads`, тож потрібен один процес/один домен.
У продакшні сервер не стартує з дефолтними паролем/секретом.
Дані зберігаються в `backend/data/shop.db`, завантажені фото — в `backend/uploads/` (робіть бекап обох).

## Деплой на Vercel (Services, beta)

`vercel.json` описує два сервіси в одному проєкті й на одному домені:

| Сервіс | Папка | Публічний шлях |
| --- | --- | --- |
| `backend` (Express) | `backend/` | `/api/*` — шлях доходить до коду без змін |
| `frontend` (Vite, статика) | `frontend/` | усе інше, SPA-fallback на `index.html` |

Bindings не потрібні: фронтенд — статичний і ходить на `/api` того ж домену, а бекенд нікого не викликає.
Демо-фото лежать у `frontend/public/demo` і віддаються фронтендом.

Змінні середовища в Vercel: `ADMIN_USERNAME`, `ADMIN_PASSWORD` (12+), `SESSION_SECRET` (24+), `ADMIN_TOTP_SECRET`,
за бажання `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID`. `TRUST_PROXY` на Vercel вмикається сам.

> ⚠️ **Обмеження зараз:** на Vercel немає постійного диска. SQLite живе в `/tmp` кожного інстансу функції —
> замовлення й зміни з адмінки зникають після «холодного» старту і не діляться між інстансами.
> Завантаження фото на Vercel вимкнене (у формі можна вставити посилання `https://`).
> Для реальної роботи потрібна зовнішня БД (наприклад Turso/libSQL або Neon Postgres) і сховище фото (Vercel Blob).
> Для одного сервера/VPS (`pnpm build` + `pnpm start`) цих обмежень немає.

## Куди приходять замовлення

1. Завжди — в адмінку `/admin` → «Замовлення» (список оновлюється кожні 30 с, нові підсвічені, у вкладці лічильник).
2. Опційно — повідомлення в Telegram: створіть бота в `@BotFather`, напишіть йому, вкажіть
   `TELEGRAM_BOT_TOKEN` і `TELEGRAM_CHAT_ID` у `backend/.env`. Без цих змінних сповіщення вимкнені.

## Безпека

- Ціни рахуються лише на сервері; усі SQL-запити параметризовані; усі вхідні дані проходять валідацію (zod) з обмеженням довжин.
- Ліміти: 240 запитів/хв на IP для всього API, 5 замовлень/10 хв на IP, 5 замовлень на добу на телефон, 8 невдалих входів/15 хв; дата замовлення — не далі ніж 90 днів уперед.
- Антибот: приховане honeypot-поле у формі замовлення.
- **Адмінка — як її захистити від підбору пароля:**
  1. Логін + пароль (`ADMIN_USERNAME`, `ADMIN_PASSWORD`, у продакшні від 12 символів).
  2. **Двофакторна автентифікація (Google Authenticator / Authy).** Виконайте `pnpm --filter konditerska-backend totp:setup`,
     додайте `ADMIN_TOTP_SECRET` в `.env`, відскануйте/введіть ключ у застосунку. Без коду зайти неможливо, навіть знаючи пароль;
     кожен код діє один раз. У продакшні без 2FA сервер не стартує.
  3. Ліміти входу: 8 невдалих спроб / 15 хв з одного IP **і** спільний ліміт 60 невдалих спроб на весь сайт (проти ботнетів із багатьма IP), пауза ~1 с після кожної помилки.
  4. Прихований URL: `VITE_ADMIN_PATH=panel-k8x2q` у `frontend/.env` перед збіркою (адмінка буде на `/panel-k8x2q`), сторінка має `noindex`.
  5. Паролі й коди порівнюються за постійний час, відповідь не каже, що саме невірне; токен підписаний HMAC, живе 12 год, іде в `Authorization: Bearer` (CSRF неможливий).
- Фото: лише PNG/JPEG/WebP, перевіряється справжня сигнатура файлу, ліміт 5 МБ; `/uploads` віддається з `nosniff` і суворим CSP; URL фото в товарах — лише `/uploads/…` або `https://…`.
- Заголовки: CSP, `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`. CORS вимкнено в продакшні.
- У продакшні сервер не стартує зі слабкими `ADMIN_PASSWORD` (< 8 символів) та `SESSION_SECRET` (< 24).
- За reverse proxy (nginx/Caddy) обов’язково виставте `TRUST_PROXY=1`, інакше ліміти рахуватимуться по IP проксі. Тримайте сайт тільки за HTTPS.

## Як адаптувати під клієнта

| Що змінити | Де |
| --- | --- |
| Назва, місто, телефон, Instagram, тексти hero/інфокарток | Адмінка → «Тексти сайту» |
| Категорії, товари, фото, ціни, свіже/заморожене | Адмінка → «Категорії», «Товари» |
| Адреси самовивозу (число `N` у тексті береться автоматично) | Адмінка → «Точки самовивозу» |
| Кольори бренду | CSS-змінні `--c-*` у `frontend/src/styles/global.scss` |
| Шрифти | `frontend/index.html` + `$font-serif` / `$font-sans` у `frontend/src/styles/_tokens.scss` |
| Hero-фото | `frontend/src/assets/images/hero.png` |

## API

Публічне: `GET /api/settings`, `/api/categories`, `/api/products?category=&state=&sort=&popular=1&limit=`,
`/api/pickup-points`, `POST /api/orders` (ціни перераховуються на сервері).

Адмін (заголовок `Authorization: Bearer <token>`): `POST /api/admin/login`, `GET|PATCH /api/admin/orders`,
CRUD `/api/admin/{products,categories,pickup-points}`, `GET|PUT /api/admin/settings`, `POST /api/admin/upload`.

## Статуси замовлень

`new` → `confirmed` → `ready` → `completed` (або `cancelled`) — змінюються в адмінці.
