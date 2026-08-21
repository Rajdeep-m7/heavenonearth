# API reference

Base URL: `/api`. All bodies and responses are JSON.

---

## 1. Response envelope

Every route returns the same shape, so the client never branches on status text.

**Success**

```jsonc
{ "ok": true, "data": { /* … */ }, "meta": { "page": 1, "total": 42 } }  // meta only on lists
```

**Failure**

```jsonc
{
  "ok": false,
  "error": { "code": "VALIDATION_FAILED", "message": "…",
             "fields": { "priceFrom": "Must be a positive number" } }
}
```

| Code | HTTP | Meaning |
| --- | --- | --- |
| `VALIDATION_FAILED` | 400 | Zod rejected the body/query; `fields` is populated |
| `UNAUTHORIZED` | 401 | missing or expired admin cookie |
| `FORBIDDEN` | 403 | authenticated but wrong role |
| `NOT_FOUND` | 404 | |
| `SLUG_TAKEN` | 409 | |
| `CATEGORY_IN_USE` | 409 | delete blocked; `data.packageCount` says how many |
| `RATE_LIMITED` | 429 | public review submission throttle |
| `SERVER_ERROR` | 500 | logged with a request id; message is generic |

---

## 2. Conventions

- **List queries:** `?page=1&limit=12&sort=-createdAt&q=darjeeling`
  `limit` is clamped to 50 to protect the free-tier database.
- **Public GETs** never return `isActive: false`, `status: "pending"`, or any
  `select: false` field.
- **Admin mutations** require the `hoe_session` cookie; the middleware rejects
  before the handler runs.
- **Cache tags:** each write calls `revalidateTag` for the entities it touched
  (`categories`, `packages`, `reviews`, `gallery`, plus `package:<slug>`).

---

## 3. Categories — the master packages

### `GET /api/categories`
Public. Active categories, sorted by `order`.

Query: `includeCounts=true` adds `packageCount` per category.

```jsonc
{ "ok": true, "data": [
  { "_id": "…", "name": "Hill", "slug": "hill", "tagline": "…",
    "thumbnail": { "publicId": "…", "url": "…", "width": 1200, "height": 800, "alt": "…" },
    "order": 0, "packageCount": 7 }
] }
```

### `GET /api/categories/[slug]`
Public. One category. `?withPackages=true` embeds its first 12 active packages.

### `POST /api/categories` · admin
Body: `name` (required), `slug?`, `tagline?`, `description?`, `heroImage?`,
`thumbnail?`, `order?`, `isActive?`, `seo?`.

### `PATCH /api/categories/[id]` · admin
Partial update, same field set.

### `DELETE /api/categories/[id]` · admin
`409 CATEGORY_IN_USE` if packages still reference it.

---

## 4. Packages

### `GET /api/packages`
Public. Filters:

| Param | Example | Notes |
| --- | --- | --- |
| `category` | `hill` | category **slug** |
| `featured` | `true` | home page rail |
| `minPrice` / `maxPrice` | `5000` | on `priceFrom` |
| `days` | `4` | exact |
| `q` | `tea garden` | text index |
| `sort` | `priceFrom` \| `-priceFrom` \| `-createdAt` \| `order` | default `order` |
| `page` / `limit` | | limit ≤ 50 |

Category is populated with `name` and `slug` only — never the whole document.

### `GET /api/packages/[slug]`
Public. Full document including `itinerary` and `images`, plus its approved
reviews and their aggregate rating:

```jsonc
{ "ok": true, "data": {
  "package": { "…": "…" },
  "reviews": [ /* approved only */ ],
  "rating":  { "value": 4.9, "count": 37 }
} }
```

### `POST /api/packages` · admin
Required: `category` (ObjectId), `title`, `summary`, `days`, `nights`,
`priceFrom`, `coverImage`.
Optional: everything else in the schema.

### `PATCH /api/packages/[id]` · admin · `DELETE /api/packages/[id]` · admin

Deleting a package also removes its Cloudinary assets (see §7).

---

## 5. Reviews

### `GET /api/reviews`
Public. Approved only, newest first.
Filters: `package` (slug), `category` (slug), `featured=true`, `page`, `limit`.

`meta` carries the aggregate: `{ "rating": { "value": 4.9, "count": 1284 } }`.

### `POST /api/reviews`
**Public, unauthenticated.** Creates a `pending` review.

```jsonc
{ "author": "Priya S.", "email": "…", "rating": 5,
  "quote": "…", "trip": "Darjeeling Tea Escape", "package": "<slug>" }
```

Protections:
- Zod: `rating` 1–5, `quote` 10–600 chars, `author` 2–60 chars.
- Honeypot field `website` — if non-empty, respond `201` and discard.
- Rate limit: 3 submissions per IP per hour (in-memory LRU; see the note in
  [`05-deployment-vercel.md`](./05-deployment-vercel.md) about serverless
  instance locality).

Responds `201` with `{ "status": "pending" }`. Never echoes the email back.

### `PATCH /api/reviews/[id]` · admin
Moderation: `{ "status": "approved" | "rejected", "isFeatured": true }`.
Setting `approved` stamps `publishedAt` and revalidates `reviews`.

### `POST /api/admin/reviews` · admin
Admin-authored review — created already `approved`, `source: "admin"`.

### `DELETE /api/reviews/[id]` · admin

---

## 6. Gallery

### `GET /api/gallery`
Public. Filters: `category` (slug), `tag`, `page`, `limit` (≤ 50).
Sorted by `order`, then newest.

### `POST /api/gallery` · admin
Accepts **one item or an array**, so the admin uploader can commit a whole
multi-file batch in a single request:

```jsonc
{ "items": [ { "image": { "publicId": "…", "url": "…", "width": 1600, "height": 1067, "alt": "…" },
               "title": "…", "tags": ["tea-garden"], "category": "<id>" } ] }
```

### `PATCH /api/gallery/[id]` · admin · `DELETE /api/gallery/[id]` · admin

### `PATCH /api/gallery/reorder` · admin
`{ "order": ["<id>", "<id>", …] }` — one `bulkWrite`, not N updates.

---

## 7. Admin: auth & uploads

### `POST /api/admin/auth/login`
`{ "email": "…", "password": "…" }` → sets the `hoe_session` cookie, returns
`{ "name": "…", "email": "…", "role": "owner" }`.

Failures return a deliberately vague `401 UNAUTHORIZED` ("Invalid email or
password") — never "no such user". A fixed ~250 ms floor on the handler blunts
timing-based user enumeration.

### `POST /api/admin/auth/logout` — clears the cookie.
### `GET /api/admin/auth/me` — current admin, or `401`.

### `POST /api/admin/upload/signature` · admin
Returns a short-lived Cloudinary signature so the **browser** uploads directly.

Request: `{ "folder": "packages" }` (allow-listed: `categories`, `packages`,
`gallery`, `reviews`).

```jsonc
{ "ok": true, "data": {
  "signature": "…", "timestamp": 1718000000,
  "apiKey": "…", "cloudName": "…",
  "folder": "heavenonearth/packages",
  "eager": "f_auto,q_auto"
} }
```

The browser POSTs the file to
`https://api.cloudinary.com/v1_1/<cloudName>/image/upload`, then sends the
returned `public_id`, `secure_url`, `width`, `height` to the entity's own
endpoint. **No image bytes ever pass through a Vercel function.**

### `POST /api/admin/upload/destroy` · admin
`{ "publicId": "…" }` — removes an orphaned asset. Called automatically when a
package/gallery item is deleted, and when an admin replaces an image.

---

## 8. Public route → cache tag map

| Page | Tags it depends on |
| --- | --- |
| `/` | `categories`, `packages`, `reviews` |
| `/destinations` | `categories` |
| `/destinations/[category]` | `categories`, `packages` |
| `/packages` | `packages`, `categories` |
| `/packages/[slug]` | `package:<slug>`, `reviews` |
| `/gallery` | `gallery` |
| `/reviews` | `reviews` |

A write to `Package` revalidates `packages` **and** `package:<its slug>`, so a
single edit refreshes exactly the affected pages and nothing else.
