# Deployment & free-tier optimisation

Target: **Vercel Hobby + MongoDB Atlas M0 + Cloudinary free**. Everything below
exists to keep the app comfortably inside those limits.

> Provider limits change. Re-check the current Hobby, M0 and Cloudinary free
> quotas before launch; the *techniques* here hold regardless of the exact
> numbers.

---

## 1. The constraints that actually shape the design

| Limit | Consequence for this app |
| --- | --- |
| Serverless **request body ~4.5 MB** | Images must **not** be posted to our API → direct-to-Cloudinary upload |
| Short **function timeout** on Hobby | Every handler must finish in ~1–2 s; no batch jobs in a request |
| **Bandwidth quota** | Images served from Cloudinary's CDN, not from Vercel |
| **Image-optimization quota** on Hobby | Bypassed entirely with a custom Cloudinary loader |
| Atlas M0: **512 MB, ~500 connections, shared CPU** | Connection caching + lean, indexed, projected queries |
| Cloudinary free: storage + monthly transformations | `f_auto,q_auto` + a fixed set of widths so variants are reused, not regenerated |
| Hobby **cron**: minimal | No scheduled jobs in v1 |

---

## 2. The single most important optimisation: static public pages

Every public route is statically rendered and revalidated **on write**, not on
read.

```ts
// app/(site)/packages/[slug]/page.tsx
export const revalidate = 3600;            // safety net
export async function generateStaticParams() { /* active package slugs */ }

const getPackage = (slug: string) =>
  unstable_cache(
    () => fetchPackage(slug),
    ["package", slug],
    { tags: ["packages", `package:${slug}`], revalidate: 3600 },
  )();
```

and on the admin side:

```ts
revalidateTag("packages");
revalidateTag(`package:${pkg.slug}`);
```

**Effect:** a visitor hitting `/packages/darjeeling-tea-and-mountain-escape`
gets HTML straight from the edge cache. Zero function invocations, zero Atlas
queries. The database is touched only when an admin saves, plus one hourly
safety refresh per page. This is what makes a free tier viable under real
traffic.

---

## 3. Mongoose connection caching

The classic serverless failure is opening a new connection per invocation until
Atlas refuses them.

```ts
// lib/db/connect.ts
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is not set");

// Survives hot reload in dev and warm-container reuse in production.
const cached = (globalThis as any)._mongoose ??= { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;
  cached.promise ??= mongoose.connect(uri!, {
    bufferCommands: false,   // fail fast instead of queueing on a cold container
    maxPoolSize: 5,          // small: many containers × big pools exhausts M0
    minPoolSize: 0,
    serverSelectionTimeoutMS: 8000,
    socketTimeoutMS: 20000,
  }).then((m) => m);
  cached.conn = await cached.promise;
  return cached.conn;
}
```

`maxPoolSize: 5` is deliberate. Vercel may run many concurrent containers; a
default pool of 100 each would blow through M0's connection cap.

Models are registered with the `mongoose.models.X ?? mongoose.model(...)`
guard so hot reload does not throw `OverwriteModelError`.

---

## 4. Query discipline

```ts
Package.find({ category: id, isActive: true })
  .select("title slug summary priceFrom days nights coverImage badge")  // project
  .populate("category", "name slug")                                    // narrow
  .sort({ order: 1 })
  .limit(12)
  .lean();                                                              // plain objects
```

- `.lean()` skips Mongoose document hydration — meaningfully faster and lighter.
- `.select()` keeps `description` and `itinerary` out of list responses.
- `limit` is clamped to 50 server-side, whatever the client asks for.
- Counts use `countDocuments` with the same filter, run in `Promise.all` with
  the page query — one round trip, not two sequential ones.
- Every filter combination in [`03-api-reference.md`](./03-api-reference.md) is
  backed by an index in [`02-data-model.md`](./02-data-model.md).

---

## 5. Images: Cloudinary end to end

### Custom loader — keeps Vercel's optimizer out of the path

```ts
// lib/cloudinary/loader.ts
"use client";
export default function cloudinaryLoader({ src, width, quality }) {
  // src is the Cloudinary publicId
  const t = ["f_auto", `q_${quality ?? "auto"}`, `w_${width}`, "c_limit", "dpr_auto"];
  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${t.join(",")}/${src}`;
}
```

```ts
// next.config.ts
images: {
  loader: "custom",
  loaderFile: "./lib/cloudinary/loader.ts",
  deviceSizes: [360, 640, 828, 1080, 1440, 1920],   // fewer widths = fewer variants
},
```

Why this matters three ways:

1. **Vercel image-optimization quota** is never consumed.
2. **Bandwidth** is served by Cloudinary's CDN, not Vercel's.
3. `f_auto` gives AVIF/WebP automatically; `q_auto` picks quality per image.

Keeping `deviceSizes` to six widths means the same handful of derived variants
is reused across the site instead of generating a new transformation per odd
width — the thing that burns a Cloudinary free plan.

### Upload path

Recap from [`03-api-reference.md`](./03-api-reference.md#7-admin-auth--uploads):
browser → signature endpoint → **direct** browser → Cloudinary → store
`publicId` only. The 4.5 MB body limit becomes irrelevant.

### Blur placeholders

Generated once at upload time from a 16 px Cloudinary variant and stored as
`blurDataURL`, so no runtime work and no extra request.

---

## 6. Bundle & runtime hygiene

- Keep `mongoose`, `bcryptjs`, `cloudinary` server-only. `import "server-only"`
  at the top of `lib/db/*` and `lib/auth/password.ts` turns an accidental client
  import into a build error.
- Admin routes are lazily reachable only under `/admin`, so their JS never ships
  to the public site.
- Only 5 components on the public site are client components (`Header`,
  `SearchPanel`, `TrendingSection`, `Rail`, `Reveal`) — everything else is RSC.
- `next/font` self-hosts Playfair Display + Poppins: no render-blocking request
  to Google, no CLS.
- `export const runtime = "nodejs"` on any route touching Mongoose. Only
  `middleware.ts` runs on Edge.

---

## 7. Rate limiting, honestly

The public review endpoint uses an in-memory LRU keyed by IP. **On serverless
this is per-container, so it is a speed bump, not a wall** — an attacker hitting
many cold containers gets more than 3 attempts.

That is an accepted trade-off for v1: it stops casual spam, and the honeypot
plus manual approval means nothing reaches the site unreviewed anyway. If abuse
becomes real, the fix is Upstash Redis (has a free tier) behind the same
interface in `lib/api/rateLimit.ts` — a one-file change.

---

## 8. Environment variables

Copy `.env.example` → `.env.local` for development; set the same keys in the
Vercel dashboard for Preview and Production.

| Variable | Where | Notes |
| --- | --- | --- |
| `MONGODB_URI` | server | Atlas SRV string, includes the database name |
| `JWT_SECRET` | server | ≥ 32 random bytes — `openssl rand -base64 48` |
| `CLOUDINARY_CLOUD_NAME` | server | |
| `CLOUDINARY_API_KEY` | server | |
| `CLOUDINARY_API_SECRET` | server | **never** expose with `NEXT_PUBLIC_` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | client | safe: it is in every image URL |
| `NEXT_PUBLIC_SITE_URL` | client | canonical origin; drives metadata + sitemap |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | local only | seed script only; do not set on Vercel |

`lib/env.ts` validates all of these with Zod at module load, so a missing
variable fails the build rather than the first request.

---

## 9. Atlas setup

1. Create a free **M0** cluster in the region closest to your Vercel region
   (`Mumbai / ap-south-1` for an India-focused site; set the same region in
   Vercel's project settings so the function and the database are neighbours).
2. Database user with `readWrite` on the app database only — not `atlasAdmin`.
3. Network access: Vercel's serverless egress IPs are not static on Hobby, so
   `0.0.0.0/0` is required. This is safe **only** because the connection string
   itself is the credential — use a long generated password and never commit it.
4. Enable the free daily snapshot if offered on your tier; otherwise schedule a
   periodic `mongodump` yourself.

---

## 10. Deploy checklist

- [ ] Push to GitHub; import the repo in Vercel
- [ ] Set every env var from §8 for **Production** and **Preview**
- [ ] Set the Vercel function region to match the Atlas region
- [ ] Atlas network access allows `0.0.0.0/0`; app user is `readWrite` only
- [ ] `npm run seed` once against production (admin + Hill/Sea/Forest)
- [ ] Log in at `/admin/login`, change the seeded password
- [ ] `npm run build` passes locally with zero type errors
- [ ] `/robots.txt` and `/sitemap.xml` show the production domain
- [ ] Add the production domain; set `NEXT_PUBLIC_SITE_URL` to it
- [ ] Lighthouse on `/` — target ≥ 95 across the board
- [ ] Rich Results Test on `/` and one package page
- [ ] Submit the sitemap in Google Search Console

---

## 11. Expected cost profile

| Resource | Steady-state use | Free-tier headroom |
| --- | --- | --- |
| Vercel functions | admin writes + hourly ISR refresh only | very large |
| Vercel bandwidth | HTML + JS + fonts (images excluded) | very large |
| Vercel image optimization | **zero** — Cloudinary loader | n/a |
| Atlas ops | ~1 read per page *per revalidation window*, not per visitor | very large |
| Cloudinary storage | a few hundred photos | comfortable |
| Cloudinary transforms | bounded by 6 widths × N images, then cached | comfortable |

The design point: **traffic scales without scaling cost**, because visitor
traffic is served from cache and never reaches the database.
