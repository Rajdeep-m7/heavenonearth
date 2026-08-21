# Heaven on Earth — Destination Experts

A mini full-stack travel site: SEO-first public pages, a JSON API, and an admin
panel, in one Next.js deployment.

**Stack** — Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 ·
MongoDB Atlas · Cloudinary · JWT auth · Vercel

---

## Documentation

Read these in order.

| Doc | What it covers |
| --- | --- |
| [`01-architecture.md`](./docs/01-architecture.md) | Stack, route map, request paths, directory layout |
| [`02-data-model.md`](./docs/02-data-model.md) | Collections, fields, indexes, slug rules, seeding |
| [`03-api-reference.md`](./docs/03-api-reference.md) | Every endpoint, response envelope, error codes, cache tags |
| [`04-auth-and-admin.md`](./docs/04-auth-and-admin.md) | Admin login, cookies, middleware, admin screens, security checklist |
| [`05-deployment-vercel.md`](./docs/05-deployment-vercel.md) | Free-tier optimisation, env vars, Atlas setup, deploy checklist |
| [`06-stays-cars-bookings.md`](./docs/06-stays-cars-bookings.md) | Room stays, car rentals, and the guest booking flow |

---

## Feature scope

**Public (no login)**
- Home, destinations by master package (hill / sea / forest), package detail
- Room stays with rooms, availability and rates
- Car rentals with per-day / per-km / fixed-route pricing
- 4-step guest booking flow for stays, cars and packages
- Gallery, reviews, review submission
- Full SEO: metadata, JSON-LD `@graph`, sitemap, robots, OG images

**Admin (login required)**
- Master packages (categories) CRUD
- Packages CRUD with itinerary builder
- Stays + nested rooms + blackout dates
- Vehicles + routes and fare grid
- Bookings queue: confirm, cancel, record payment
- Reviews moderation, gallery management
- Direct-to-Cloudinary image uploads

---

## Quick start

```bash
npm install
cp .env.example .env.local        # then fill in the values
npm run seed                      # admin user + Hill / Sea / Forest
npm run dev                       # http://localhost:3000
```

Admin panel: `http://localhost:3000/admin/login`

## Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | dev server |
| `npm run build` | production build |
| `npm run start` | serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run seed` | idempotent seed (admin + starter data) |

---

## Current status

| Area | State |
| --- | --- |
| Home page UI | **Built** — matches the approved design, now DB-driven |
| SEO foundation | **Built** — metadata, JSON-LD graph, sitemap, robots, manifest |
| Design tokens | **Built** — palette and type scale sampled from the PDFs |
| Docs | **Built** — this set |
| Database layer | **Built** — cached connection, 7 models, indexes, slug hooks |
| Public API | **Built** — categories, packages, stays, rooms, reviews, gallery |
| Admin auth | **Built** — login, JWT cookie, Edge middleware, `requireAdmin` |
| Cloudinary | **Built** — signed direct upload, custom `next/image` loader |
| Seed script | **Built** — `npm run seed` |
| Admin panel UI | Not yet built — waiting on reference screens |
| Cars / bookings | Specified in doc 06, not yet implemented |

**Before Atlas is configured** the home page falls back to the design fixtures
in `lib/data/` so the site still renders; the API returns a clear
"database is not configured" error rather than a generic 500. After
`npm run seed`, the same page reads from MongoDB with no component changes.

---

## Two decisions that need your call

1. **Online payments.** v1 as specified ships *pay-later*: a booking is created
   as `pending` / `unpaid` and your team confirms by phone. Wiring Razorpay adds
   a provider account, a webhook route and its own testing pass. Say the word if
   it must be in the first release.
2. **The remaining screens.** Send the reference designs for stays, cars,
   booking steps and the admin panel and the UI will follow them the same way
   the home page followed `Home.pdf`.
