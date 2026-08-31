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
| [`06-stays-cars-bookings.md`](./docs/06-stays-cars-bookings.md) | Room stays with real availability, and flight/car/train requests |

---

## Feature scope

**Public (no login, no checkout)**
- Home, destinations by master package (hill / sea / forest), package detail
- Room stays with rooms, shown as a catalog — price and amenities, no
  availability calendar
- Flights, cars, and trains — a page per service describing what is arranged
- **Every "Book" / "Enquire" action opens WhatsApp** with a pre-filled
  message to the owner. Nothing is booked, paid, or stored on the site.
- Gallery, reviews, review submission
- Full SEO: metadata, JSON-LD `@graph`, sitemap, robots, OG images

**Admin (login required)**
- Master packages (categories) CRUD
- Packages CRUD with itinerary builder
- Stays + nested rooms
- Reviews moderation, gallery management
- Admin user management (owner-only): add, edit, deactivate other admins
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
| Home page UI | **Built** — matches the approved design, DB-driven, verified against live Atlas + Cloudinary |
| SEO foundation | **Built** — metadata, JSON-LD graph, sitemap, robots, manifest |
| Database layer | **Built** — cached connection, models + indexes for categories, packages, stays, rooms, reviews, gallery, admins |
| Public API | **Built** — categories, packages, stays, rooms, reviews, gallery |
| Admin auth | **Built** — login, JWT cookie, Edge middleware, `requireAdmin` / `requireOwner` |
| Cloudinary | **Built** — signed direct upload, custom `next/image` loader |
| Admin panel | **Built** — dashboard, categories, packages (+ itinerary builder), stays (+ rooms), reviews moderation, gallery, owner-only admin-user management |
| Seed script | **Built** — `npm run seed`, plus `npm run admin:add` for additional admins |
| Public pages beyond home | Not built — `/destinations`, `/packages`, `/stays`, `/gallery`, `/reviews` all have working APIs behind them already |
| WhatsApp CTA (`lib/whatsapp.ts` + button) | Specified in doc 06, not yet implemented — small, needed before any "Book"/"Enquire" button exists |
| `/flights`, `/cars`, `/trains` | Specified in doc 06 as static pages + one WhatsApp button each; not yet implemented |

**Before Atlas is configured** the home page falls back to the design fixtures
in `lib/data/` so the site still renders; the API returns a clear
"database is not configured" error rather than a generic 500. After
`npm run seed`, the same page reads from MongoDB with no component changes.

---

## The core decision

**The website never takes a booking or a payment.** For stays, packages,
flights, cars, and trains alike, every call to action opens a pre-filled
WhatsApp chat with the owner — that is where dates, pricing, and confirmation
actually happen. There is no `Booking` model, no checkout, no reference code,
no payment status to track. See
[`06-stays-cars-bookings.md`](./docs/06-stays-cars-bookings.md) for the
pattern and why it fits this business better than a booking engine would.
