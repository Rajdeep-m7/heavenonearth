# Architecture

Heaven on Earth is a **mini full-stack Next.js app**: one deployment serves the
public marketing site, the JSON API, and the admin panel.

---

## 1. Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | Next.js 15, App Router, TypeScript | One deploy for UI + API; RSC keeps client JS small |
| Styling | Tailwind CSS v4 | Design tokens already sampled from the approved PDFs |
| Database | MongoDB Atlas **M0 (free)** | Free tier, document shape fits nested itineraries |
| ODM | Mongoose 8 | Schema validation + a single place for indexes |
| Images | Cloudinary (free tier) | Storage **and** CDN **and** on-the-fly transforms |
| Auth | JWT (HS256) in an httpOnly cookie, verified in Edge middleware via `jose` | No session store, no extra DB round-trip per request |
| Hosting | Vercel Hobby | Free, first-class Next.js support |

Only the admin panel is authenticated. **Public visitors never log in.**

---

## 2. Route map

```
app/
├─ (site)/                     PUBLIC — statically rendered + ISR
│  ├─ page.tsx                 Home  (built)
│  ├─ destinations/
│  │  ├─ page.tsx              All categories (hill / sea / forest …)
│  │  └─ [category]/page.tsx   One category + its packages
│  ├─ packages/
│  │  ├─ page.tsx              All packages, filterable
│  │  └─ [slug]/page.tsx       One package detail
│  ├─ stays/                   room stays
│  │  ├─ page.tsx
│  │  └─ [slug]/page.tsx       property + bookable rooms
│  ├─ cars/                    car rentals
│  │  ├─ page.tsx
│  │  └─ [slug]/page.tsx
│  ├─ booking/                 4-step guest flow — noindex, no login
│  │  └─ [type]/…              stay | car | package
│  ├─ gallery/page.tsx
│  ├─ reviews/page.tsx
│  └─ contact/page.tsx
│
├─ admin/                      PRIVATE — dynamic, cookie-gated
│  ├─ login/page.tsx           the only unauthenticated admin route
│  ├─ page.tsx                 dashboard
│  ├─ categories/…             master packages CRUD
│  ├─ packages/…               packages CRUD
│  ├─ stays/…                  stays + nested rooms + blackouts
│  ├─ vehicles/…               cars + routes/fares
│  ├─ bookings/…               booking queue & payment status
│  ├─ reviews/…                moderate + create
│  └─ gallery/…                gallery CRUD
│
└─ api/
   ├─ categories/…             GET public · POST/PATCH/DELETE admin
   ├─ packages/…               GET public · POST/PATCH/DELETE admin
   ├─ stays/…                  GET public (+ /availability) · admin CRUD
   ├─ rooms/…                  admin CRUD · blackouts
   ├─ vehicles/…               GET public (+ /quote) · admin CRUD
   ├─ routes/…                 GET public · admin CRUD
   ├─ bookings/…               POST public · GET by reference+email
   ├─ reviews/…                GET public (approved only) · POST public (pending) · admin moderation
   ├─ gallery/…                GET public · admin CRUD
   └─ admin/
      ├─ auth/login            POST — issues the cookie
      ├─ auth/logout           POST
      ├─ auth/me               GET
      ├─ bookings/…            GET/PATCH — admin booking management
      └─ upload/signature      POST — signs a direct-to-Cloudinary upload
```

Stays, cars and the booking flow are specified in
[`06-stays-cars-bookings.md`](./06-stays-cars-bookings.md).

`middleware.ts` protects `/admin/*` and `/api/admin/*` (login excluded).

---

## 3. The core relationship

> "All packages belong to a master package like hill, sea, forest — also added
> by admin."

That master package is the **Category** collection. It is admin-managed data,
not a hard-coded enum, so the client can add "Desert" or "Backwaters" later
without a redeploy.

```
Category (master package)          Package
┌───────────────────────┐         ┌────────────────────────────┐
│ _id                   │◄────────┤ category  (ObjectId, ref)   │
│ name    "Hill"        │  1 : N  │ title     "Darjeeling Tea…" │
│ slug    "hill"        │         │ slug, priceFrom, days …    │
│ heroImage {Cloudinary}│         │ images[]  {Cloudinary}     │
│ order, isActive       │         │ itinerary[]                │
└───────────────────────┘         └────────────────────────────┘
        ▲                                       ▲
        │ optional                              │ optional
   GalleryItem.category                    Review.package
```

`Review` and `GalleryItem` are independent collections; both may *optionally*
point at a package or category so the same records can power both a global
`/reviews` page and a per-package review block.

The stay and car modules hang off the same `Category` spine:

```
Category ──┬── Package
           ├── Stay ──── Room ──── RoomBlackout
           └── (Vehicle is category-independent; grouped by operatingRegions)

Booking ──► one of { Package | Room | Vehicle }   ·  guest, no account
```

`Booking` is a single collection with a `type` discriminator
(`stay` / `car` / `package`) rather than three parallel collections — one admin
queue, one status machine, one reference-code scheme.

---

## 4. Request paths

### Public read — the fast path

```
Visitor → Vercel Edge CDN → (cache HIT: static HTML, 0 functions used)
                          → (cache MISS: RSC → Mongoose → Atlas → HTML, then cached)
```

Public pages are **statically rendered with ISR**. They are regenerated only
when an admin saves something (via `revalidateTag`) or when the time-based
window expires. Steady-state traffic costs almost no serverless invocations —
this is the single biggest reason the app fits comfortably in the free tier.

### Admin write

```
Admin form → POST /api/…  → middleware verifies JWT cookie
                          → Zod validates body
                          → Mongoose writes to Atlas
                          → revalidateTag("packages") … public pages refresh
```

### Image upload — never through our server

```
Browser → POST /api/admin/upload/signature   (tiny JSON: signature + timestamp)
Browser → POST direct to Cloudinary          (the actual file bytes)
Browser → POST /api/packages                 (stores public_id + secure_url only)
```

The file bytes never touch a Vercel function. This dodges the **4.5 MB request
body limit** and the function timeout, and it keeps uploads fast. See
[`05-deployment-vercel.md`](./05-deployment-vercel.md).

---

## 5. Directory layout (final)

```
heavenonearth/
├─ app/                  routes (above)
├─ components/
│  ├─ home/              built — home page sections
│  ├─ layout/            Header, Footer
│  ├─ admin/             admin-only UI (tables, forms, uploader)
│  ├─ seo/               JsonLd
│  └─ ui/                Icons, Rail, Reveal, Button, Field…
├─ lib/
│  ├─ db/
│  │  ├─ connect.ts      cached Mongoose connection  ← critical for serverless
│  │  └─ models/         Category, Package, Stay, Room, RoomBlackout,
│  │                     Vehicle, Route, Booking, Review, GalleryItem, Admin
│  ├─ auth/              jwt.ts (sign/verify), password.ts (bcrypt), session.ts
│  ├─ cloudinary/        server.ts (signature), loader.ts (next/image loader)
│  ├─ pricing/           vehicle.ts, stay.ts — pure, unit-tested quote engines
│  ├─ booking/           availability.ts, reference.ts
│  ├─ validation/        Zod schemas — shared by API routes and admin forms
│  ├─ api/               respond.ts (uniform JSON envelope), errors.ts
│  ├─ seo/schema.ts      built — JSON-LD graph
│  └─ site.ts            built — site config
├─ docs/                 you are here
├─ middleware.ts         admin route guard
└─ scripts/seed.ts       seeds admin user + the three starter categories
```

---

## 6. Design principles

1. **The database is the CMS.** No hard-coded package lists in production code.
   The existing `lib/data/*.ts` files stay only as seed fixtures.
2. **Public pages are static.** Every public route is cached; only admin routes
   are dynamic.
3. **Validate once, in Zod, share everywhere.** The same schema validates the
   admin form and the API body.
4. **Cloudinary owns image bytes and transforms.** Vercel never resizes an
   image; `next/image` points at Cloudinary through a custom loader.
5. **Fail loudly on config.** Missing `MONGODB_URI` / `JWT_SECRET` throws at
   startup, not on the first request.
