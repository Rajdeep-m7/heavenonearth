# Auth & the admin panel

Public visitors never authenticate. Only `/admin/*` and the mutating API routes
are gated.

---

## 1. Why JWT-in-a-cookie

A database-backed session would mean an extra Atlas round-trip on **every**
admin request — expensive on an M0 cluster and on serverless cold starts. A
signed JWT verifies with pure CPU in Edge middleware: no DB, no network.

The trade-off is that a token cannot be revoked before it expires. Mitigations:

- Short lifetime — **8 hours**, matching a working day.
- `isActive: false` on the `Admin` document is re-checked by
  `GET /api/admin/auth/me`, which the admin shell calls on mount. A disabled
  admin is logged out within one page load.
- Rotating `JWT_SECRET` invalidates every outstanding token immediately — the
  break-glass option.

That is the right balance for a two-or-three-person admin team. A revocation
list is a v2 item.

---

## 2. The cookie

| Attribute | Value | Reason |
| --- | --- | --- |
| name | `hoe_session` | |
| `httpOnly` | `true` | JavaScript cannot read it — blunts XSS token theft |
| `secure` | `true` in production | HTTPS only |
| `sameSite` | `lax` | blocks cross-site POST (CSRF) while keeping normal navigation working |
| `path` | `/` | |
| `maxAge` | `60 * 60 * 8` | 8 hours |

`sameSite: "lax"` is what makes a separate CSRF token unnecessary: a
cross-origin form POST does not carry the cookie. All mutations are
`POST`/`PATCH`/`DELETE` — never `GET` — so nothing state-changing is reachable
by a top-level navigation either.

### Token payload

```jsonc
{ "sub": "<admin _id>", "email": "…", "role": "owner", "iat": …, "exp": … }
```

Signed HS256 with `JWT_SECRET` (≥ 32 random bytes). Nothing secret is in the
payload — a JWT is signed, not encrypted.

---

## 3. Passwords

- bcrypt, cost factor **12**.
- Hashed in `lib/auth/password.ts`; the plaintext never leaves the handler.
- `passwordHash` is `select: false`, so it cannot leak through a stray
  `.find()` or a populated document.
- Minimum 12 characters, enforced by Zod on seed and on password change.

`bcryptjs` is used rather than native `bcrypt` — no compilation step, which
matters on Vercel's build image.

---

## 4. `middleware.ts`

```ts
export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
```

Logic:

1. Allow `/admin/login` and `/api/admin/auth/login` through.
2. Read `hoe_session`. Missing → redirect page requests to
   `/admin/login?next=<path>`; answer API requests with `401 UNAUTHORIZED`.
3. Verify with `jose.jwtVerify`. Invalid or expired → same as missing, and the
   stale cookie is cleared.
4. Forward `x-admin-id` and `x-admin-role` headers so handlers skip re-parsing.

Middleware runs on the **Edge runtime**, so it must stay dependency-light.
`jose` is Web-Crypto based and works there; `jsonwebtoken` and `bcryptjs` do
**not** — they are used only inside Node.js route handlers.

> Mutating routes outside `/api/admin/*` (e.g. `POST /api/packages`) are **not**
> covered by the matcher. They call `requireAdmin(req)` from
> `lib/auth/session.ts` as their first line. Middleware is defence in depth, not
> the only check.

---

## 5. Admin UI

`app/admin/layout.tsx` is a server component that reads the cookie, loads the
admin, and renders the shell. It sets `export const dynamic = "force-dynamic"`
so no admin page is ever cached or prerendered.

```
┌────────────┬──────────────────────────────────────────┐
│  Sidebar   │  Topbar: page title · admin name · logout │
│            ├──────────────────────────────────────────┤
│ Dashboard  │                                          │
│ Categories │   content                                │
│ Packages   │                                          │
│ Reviews  ② │   ② = badge with pending count           │
│ Gallery    │                                          │
└────────────┴──────────────────────────────────────────┘
```

**Screens**

| Screen | Contents |
| --- | --- |
| Dashboard | counts per collection, pending-review queue, recent activity |
| Categories | sortable table (drag to set `order`), create/edit drawer |
| Packages | filterable table (category, active, featured); full editor with itinerary repeater and multi-image uploader |
| Reviews | tabs Pending / Approved / Rejected; approve, reject, feature, delete; "Add review" for admin-authored entries |
| Gallery | responsive grid, multi-file drop zone, drag-reorder, tag + category assignment, bulk delete |

The visual design of these screens follows the reference screenshots you will
share; the palette and type scale already live in `app/globals.css`.

**Form pattern.** Every form is a client component driven by the same Zod schema
the API uses, so validation messages match exactly. Submits go through a shared
`useApiForm` hook that handles the envelope, maps `error.fields` onto inputs,
and shows a toast.

---

## 6. Image uploader

`components/admin/ImageUploader.tsx`:

1. Client-side guard: `image/*`, ≤ 10 MB, and the dimensions are read before
   upload so a 20 MP phone photo is caught early.
2. `POST /api/admin/upload/signature` → signature + timestamp.
3. `XMLHttpRequest` POST straight to Cloudinary, with a real progress bar
   (`fetch` has no upload progress).
4. On success, capture `public_id`, `secure_url`, `width`, `height`.
5. Admin types the **alt text** — required before the form will save. Alt text
   is an SEO and accessibility asset, so the UI treats it as mandatory content,
   not an afterthought.
6. Replacing an image queues the old `publicId` for
   `POST /api/admin/upload/destroy` after the parent document saves
   successfully — so a failed save never orphans the live image.

---

## 7. Bootstrapping the first admin

There is no signup route. Run once, locally, against the production database:

```bash
SEED_ADMIN_EMAIL=owner@example.com \
SEED_ADMIN_PASSWORD='a-long-random-passphrase' \
npm run seed
```

The script upserts by email, so re-running is safe and will not reset an
existing password. Change the password afterwards from the admin profile page,
and remove the seed variables from your shell history.

---

## 8. Security checklist

- [x] `httpOnly` + `secure` + `sameSite=lax` cookie
- [x] bcrypt cost 12; `passwordHash` never selected
- [x] Uniform vague login failure + constant-ish response time
- [x] Every mutating handler calls `requireAdmin` itself
- [x] Zod validation on every body and query
- [x] Mongoose casting + explicit projections (no raw `$where`, no user-supplied
      operators reaching a query)
- [x] Public read paths force `isActive`/`approved` at the data layer
- [x] Rate limit on the public review endpoint + honeypot
- [x] Cloudinary upload folders are allow-listed server-side
- [x] Secrets only in Vercel env vars; `.env*.local` is git-ignored
- [x] Security headers set in `next.config.ts`
- [ ] v2: token revocation list, admin audit log, 2FA
