# Data model

MongoDB Atlas, five collections. Every schema carries `timestamps: true`
(`createdAt` / `updatedAt`).

A shared sub-document is used everywhere an image is stored:

```ts
// lib/db/models/shared.ts
export const CloudinaryImageSchema = new Schema({
  publicId: { type: String, required: true },  // "heavenonearth/packages/abc123"
  url:      { type: String, required: true },  // secure_url, used as fallback
  width:    { type: Number, required: true },
  height:   { type: Number, required: true },
  alt:      { type: String, default: "" },     // authored by admin — SEO + a11y
  blurDataURL: { type: String },               // tiny base64 LQIP
}, { _id: false });
```

`publicId` is the source of truth — the loader rebuilds any size from it, so a
Cloudinary account move only needs the cloud name changed.

---

## 1. `Category` — the master package

The "hill / sea / forest" grouping. Admin-managed.

| Field | Type | Notes |
| --- | --- | --- |
| `name` | String, required | "Hill", "Sea", "Forest" |
| `slug` | String, required, **unique**, lowercase | URL segment; auto-derived from name, editable |
| `tagline` | String | short line under the title |
| `description` | String | long copy for the category page |
| `heroImage` | CloudinaryImage | category page banner |
| `thumbnail` | CloudinaryImage | card image in listings |
| `icon` | String | optional icon key |
| `order` | Number, default `0` | manual sort in listings |
| `isActive` | Boolean, default `true` | soft hide from the public site |
| `seo` | `{ title, description, keywords[] }` | overrides page defaults |

**Indexes**

```ts
{ slug: 1 }                 // unique
{ isActive: 1, order: 1 }   // the public listing query
```

**Deleting a category** is blocked while packages still reference it. The API
returns `409 CATEGORY_IN_USE` with the count. Admin must reassign or delete
those packages first.

---

## 2. `Package`

| Field | Type | Notes |
| --- | --- | --- |
| `category` | ObjectId → `Category`, required, indexed | the master package |
| `title` | String, required | "Darjeeling Tea & Mountain Escape" |
| `slug` | String, required, **unique**, lowercase | |
| `summary` | String, required, max 300 | card blurb |
| `description` | String | full copy (Markdown allowed) |
| `destination` | String | "Darjeeling, West Bengal" |
| `days` / `nights` | Number, required | `duration` is derived, not stored |
| `priceFrom` | Number, required, min 0 | per person, in `currency` minor-unit-free integer |
| `currency` | String, default `"INR"` | ISO 4217 |
| `inclusions` | [String] | "Stay", "Breakfast" |
| `exclusions` | [String] | |
| `itinerary` | `[{ day: Number, title: String, detail: String }]` | ordered |
| `coverImage` | CloudinaryImage, required | card + OG image |
| `images` | [CloudinaryImage] | detail gallery |
| `badge` | String enum: `bestSeller` \| `newJourney` \| `none`, default `none` | matches the ribbon in the design |
| `isFeatured` | Boolean, default `false` | shows in the home "Journeys Made For You" rail |
| `isActive` | Boolean, default `true` | |
| `order` | Number, default `0` | |
| `seo` | `{ title, description, keywords[] }` | |

**Indexes**

```ts
{ slug: 1 }                                 // unique
{ category: 1, isActive: 1, order: 1 }      // category page
{ isFeatured: 1, isActive: 1 }              // home page rail
{ title: "text", summary: "text", destination: "text" }  // search box
```

> **Free-tier note.** M0 allows a limited number of indexes; the five above are
> the full set. Do not add per-field indexes casually.

**Derived, never stored:** `duration` (`"4 Days / 3 Nights"`) and the formatted
price — both computed in the view layer so a currency or wording change does
not require a migration.

---

## 3. `Review`

Public visitors may submit one; it stays hidden until an admin approves it.

| Field | Type | Notes |
| --- | --- | --- |
| `author` | String, required | display name — "Marcus T." |
| `email` | String, select: `false` | never returned by the public API |
| `rating` | Number, required, 1–5 | |
| `quote` | String, required, max 600 | |
| `trip` | String | "Sikkim Explorer" |
| `location` | String | |
| `avatar` | CloudinaryImage | optional; falls back to an initial |
| `package` | ObjectId → `Package` | optional |
| `category` | ObjectId → `Category` | optional |
| `status` | String enum: `pending` \| `approved` \| `rejected`, default `pending` | |
| `isFeatured` | Boolean, default `false` | home page rail |
| `publishedAt` | Date | set when approved |
| `source` | String enum: `web` \| `admin`, default `web` | admin-entered reviews skip moderation |

**Indexes**

```ts
{ status: 1, publishedAt: -1 }
{ package: 1, status: 1 }
```

The public `GET /api/reviews` **always** injects `status: "approved"` at the
data layer, so a forgotten query param can never leak a pending review.

Aggregate rating for JSON-LD is computed with a single `$group` over approved
reviews and cached alongside the page.

---

## 4. `GalleryItem`

| Field | Type | Notes |
| --- | --- | --- |
| `image` | CloudinaryImage, required | |
| `title` | String | |
| `caption` | String | |
| `tags` | [String], indexed | "sunrise", "tea-garden" |
| `category` | ObjectId → `Category` | optional filter |
| `package` | ObjectId → `Package` | optional |
| `order` | Number, default `0` | |
| `isActive` | Boolean, default `true` | |

**Indexes**

```ts
{ isActive: 1, order: 1 }
{ category: 1, isActive: 1 }
{ tags: 1 }
```

---

## 5. `Admin`

| Field | Type | Notes |
| --- | --- | --- |
| `email` | String, required, **unique**, lowercase | |
| `passwordHash` | String, required, select: `false` | bcrypt, cost 12 |
| `name` | String, required | |
| `role` | String enum: `owner` \| `editor`, default `editor` | `owner` may manage admins |
| `lastLoginAt` | Date | |
| `isActive` | Boolean, default `true` | disable without deleting |

Created by `scripts/seed.ts`, never through a public route. There is **no
signup endpoint** — that is deliberate.

---

## 6. Slug rules

Applied by a shared `pre("validate")` hook on `Category` and `Package`:

1. If `slug` is empty, derive it from `name`/`title`: lowercase, strip
   diacritics, non-alphanumerics → `-`, collapse repeats, trim.
2. On collision, append `-2`, `-3`, … until free.
3. Once a document is published, changing the slug is allowed but the admin UI
   warns that existing links will break. (A `redirects` collection is a
   deliberate v2 item, not v1.)

---

## 7. Seed data

`scripts/seed.ts` is idempotent (`upsert` by slug) and creates:

- one `Admin` from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`
- three categories: **Hill**, **Sea**, **Forest**
- the two packages and three homestays currently hard-coded in `lib/data/*.ts`,
  so the home page keeps rendering identical content after the cutover

Run with `npm run seed`.
