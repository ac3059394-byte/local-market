# LocalMarket — Local Market Product Listing & Search Platform

A starter, production-oriented codebase for a Google Maps + Justdial + IndiaMART style
marketplace where shop owners list products and customers search for what's available nearby.

This is a **foundation**, not the entire feature wishlist from the brief — it gives you a real,
working core (auth, shop & product management, search + filters, reviews, favorites, reports,
admin moderation) with a clean structure to extend into the rest (payments, live chat, AI
recommendations, etc.). See "What's stubbed vs. built" below.

---

## Stack

| Layer      | Technology |
|------------|------------|
| Frontend   | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend    | Node.js, Express.js |
| Database   | PostgreSQL + Prisma ORM |
| Auth       | JWT (access + refresh tokens), bcrypt password hashing |
| Images     | Cloudinary |
| Deployment | Vercel (frontend), Railway / Render / Supabase (backend + DB) |

---

## Project structure

```
local-market/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Full data model
│   │   └── seed.js            # Demo data (shop, products, 3 test accounts)
│   ├── src/
│   │   ├── config/            # DB client, Cloudinary
│   │   ├── middleware/        # auth, error handling, validation
│   │   ├── controllers/       # business logic per resource
│   │   ├── routes/            # REST endpoints
│   │   └── index.js           # Express app entrypoint
│   └── .env.example
└── frontend/
    ├── app/                   # Next.js App Router pages
    │   ├── page.tsx           # Homepage
    │   ├── search/            # Search results (products/shops, filters)
    │   ├── shop/[id]/         # Public shop profile
    │   ├── product/[id]/      # Product detail
    │   ├── login/ signup/     # Auth
    │   ├── dashboard/         # Shop owner: shop settings, product management
    │   └── admin/             # Admin: stats + report moderation
    ├── components/            # Navbar, Footer, ProductCard, ShopCard, etc.
    ├── lib/                   # API client (axios), shared TS types
    └── .env.example
```

---

## Getting started

### 1. Backend

```bash
cd backend
cp .env.example .env        # fill in DATABASE_URL, JWT secrets, Cloudinary keys
npm install
npm run prisma:generate
npm run prisma:migrate      # creates tables from schema.prisma
npm run seed                # optional — adds demo shop, products, test logins
npm run dev                 # http://localhost:5000
```

You need a PostgreSQL database. Easiest options: a free [Supabase](https://supabase.com)
or [Railway](https://railway.app) Postgres instance — copy their connection string into
`DATABASE_URL`.

Demo logins after seeding:
- Shop owner: `owner@example.com` / `password123`
- Admin: `admin@example.com` / `admin123`
- Customer: `customer@example.com` / `customer123`

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local  # NEXT_PUBLIC_API_URL, Google Maps key (optional for now)
npm install
npm run dev                 # http://localhost:3000
```

---

## What's built vs. what's stubbed

**Built and working:**
- JWT auth (signup/login/refresh/me), role-based access (customer / shop owner / admin)
- Shop CRUD, logo/banner/photo upload, nearby-shop lookup (haversine distance)
- Product CRUD, quick stock/price update, image upload
- Search API: product & shop search with filters (price, city, delivery, category), sorting,
  pagination, and an autosuggest endpoint
- Reviews (rating + comment + shop rating aggregation), favorites/wishlist, fake-listing reports,
  customer→shop inquiries with owner notification
- Admin dashboard: stats, report moderation, shop verification/featuring, membership tier
- Frontend: homepage, search page with filters, shop profile, product detail, login/signup,
  shop owner dashboard (shop settings + product table with inline stock/price edit + add/edit
  modal), basic admin panel

**Intentionally left as extension points** (noted with comments in the code where relevant):
- Google Login / Phone OTP — stubs are in `authController.js`; wire to Google's token
  verification and an OTP provider (MSG91, Twilio Verify)
- Payments, online ordering, delivery tracking
- Real-time chat between customer and shop
- AI product recommendations / duplicate detection / sales prediction
- Google Maps interactive map component on the frontend (backend already returns lat/lng
  and a `/shops/nearby` endpoint — drop in `@react-google-maps/api`, already in
  `package.json`, once you have a Maps API key)
- Multi-language toggle (Hindi font is already loaded via `Noto_Sans_Devanagari` in
  `app/layout.tsx`; wire up `next-intl` or similar for full i18n)
- SEO: add `app/sitemap.ts`, `app/robots.ts`, and per-page `generateMetadata` using the
  product/shop data once content volume justifies it

---

## Scaling notes

- **Geo search**: the `/shops/nearby` endpoint uses a bounding-box + haversine filter in
  application code, fine for tens of thousands of shops. Past that, enable the PostGIS
  extension on your Postgres instance and switch to `ST_DWithin` queries for indexed,
  constant-time radius search.
- **Full-text search**: current search uses Prisma's `contains` (ILIKE). For large catalogs,
  add PostgreSQL's built-in full-text search (`tsvector` + GIN index) or move to
  Meilisearch/Typesense/Elasticsearch for typo-tolerant, ranked search with faceting.
- **Caching**: Redis is listed as a dependency target — cache popular search queries and
  category listings there once traffic justifies it.
- **Images**: Cloudinary handles transformation/CDN delivery out of the box; no change needed
  as you scale.

---

## Security checklist already in place

- Helmet (secure headers), CORS locked to `CLIENT_URL`, rate limiting (global + stricter on
  `/auth`), `xss-clean` sanitization, bcrypt password hashing (12 rounds), JWT with short-lived
  access tokens + refresh flow, role-based route guards, Prisma parameterized queries (no raw
  SQL injection surface).

Before going to production: rotate the example JWT secrets, enable HTTPS at your hosting layer
(Vercel/Railway do this automatically), and add request logging/alerting for the admin routes.
