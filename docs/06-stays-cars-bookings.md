# Room stays, car rentals & bookings

Three more admin-managed entities and the guest booking flow that sits on top
of them. Everything here follows the conventions already set in
[`02-data-model.md`](./02-data-model.md) and
[`03-api-reference.md`](./03-api-reference.md) — same `CloudinaryImage`
sub-document, same response envelope, same cache-tag discipline.

**Guests never log in.** A booking is identified by a generated reference code
plus the guest's email/phone.

---

## Part A — Room stays

Modelled as **Stay** (the property) → **Room** (what is actually bookable).
A homestay with three room types is one `Stay` and three `Room` documents.

### `Stay`

| Field | Type | Notes |
| --- | --- | --- |
| `name` | String, required | "Glenburn Tea Estate" |
| `slug` | String, required, **unique** | |
| `category` | ObjectId → `Category` | optional — hill / sea / forest |
| `summary` | String, required, max 300 | card blurb |
| `description` | String | full copy |
| `location` | `{ address, locality, region, country, lat, lng }` | `locality` drives the "Darjeeling, West Bengal" line |
| `propertyType` | enum `homestay` \| `resort` \| `cottage` \| `teaBungalow` \| `camp` | |
| `amenities` | [String] | "Wi-Fi", "Bonfire", "Mountain view" |
| `houseRules` | [String] | |
| `checkInTime` / `checkOutTime` | String, default `"12:00"` / `"11:00"` | |
| `coverImage` | CloudinaryImage, required | |
| `images` | [CloudinaryImage] | |
| `priceFrom` | Number | **denormalised** — cheapest active room; recomputed on room save |
| `isFeatured` / `isActive` | Boolean | `isFeatured` drives the home "Stay Like You Belong Here" rail |
| `order` | Number | |
| `seo` | `{ title, description, keywords[] }` | |

`priceFrom` is denormalised on purpose: listing pages would otherwise need a
join or an aggregation per card. It is recalculated in the same transaction as
any room create/update/delete, so it cannot drift.

**Indexes:** `{ slug: 1 }` unique · `{ isActive: 1, order: 1 }` ·
`{ category: 1, isActive: 1 }` · `{ isFeatured: 1, isActive: 1 }`

### `Room`

| Field | Type | Notes |
| --- | --- | --- |
| `stay` | ObjectId → `Stay`, required, indexed | |
| `name` | String, required | "Deluxe Valley-View Double" |
| `description` | String | |
| `maxAdults` / `maxChildren` | Number, required / default 0 | |
| `bedType` | String | "1 King" |
| `sizeSqft` | Number | |
| `pricePerNight` | Number, required, min 0 | base rate |
| `extraGuestCharge` | Number, default 0 | per extra guest per night |
| `totalUnits` | Number, required, min 1 | how many of this room exist |
| `amenities` | [String] | |
| `images` | [CloudinaryImage] | |
| `isActive` | Boolean, default `true` | |

**Indexes:** `{ stay: 1, isActive: 1 }`

### Availability — the deliberately simple version

v1 does **not** run a channel manager. Availability is derived:

```
unitsFree(room, from, to) =
  room.totalUnits
  − confirmedBookingsOverlapping(room, from, to)
  − blackoutUnits(room, from, to)
```

`RoomBlackout` `{ room, from, to, units, reason }` lets an admin close rooms for
maintenance or an offline booking. Overlap test is the standard
`from < existing.to && to > existing.from`.

This is honest about its limits: it is correct for a single-source-of-truth
property, and it is not a replacement for OTA sync. Concurrency is handled at
booking time (see Part C).

---

## Part B — Car rentals

### `Vehicle`

| Field | Type | Notes |
| --- | --- | --- |
| `name` | String, required | "Toyota Innova Crysta" |
| `slug` | String, required, **unique** | |
| `vehicleType` | enum `hatchback` \| `sedan` \| `suv` \| `tempoTraveller` \| `bus` | |
| `seats` | Number, required | excludes the driver |
| `luggage` | Number | large bags |
| `transmission` | enum `manual` \| `automatic` | |
| `fuel` | enum `petrol` \| `diesel` \| `cng` \| `electric` | |
| `hasAC` | Boolean, default `true` | |
| `features` | [String] | "Carrier", "Pushback seats" |
| `coverImage` | CloudinaryImage, required | |
| `images` | [CloudinaryImage] | |
| **Pricing** | | |
| `pricingMode` | enum `perDay` \| `perKm` \| `both`, required | |
| `pricePerDay` | Number | required when mode includes `perDay` |
| `includedKmPerDay` | Number | e.g. 250 |
| `pricePerKm` | Number | required when mode includes `perKm` |
| `extraKmCharge` | Number | beyond `includedKmPerDay` |
| `driverAllowancePerDay` | Number, default 0 | |
| `minimumBillingKmPerDay` | Number | common in hill routes |
| `operatingRegions` | [String], indexed | "Darjeeling", "Sikkim" |
| `totalUnits` | Number, required, min 1 | fleet count |
| `isFeatured` / `isActive` | Boolean | |
| `order` | Number | |

Zod refines the pricing block so `perDay` cannot be saved without
`pricePerDay` — invalid rate cards are rejected at the edge, not discovered at
quote time.

**Indexes:** `{ slug: 1 }` unique · `{ isActive: 1, order: 1 }` ·
`{ vehicleType: 1, isActive: 1 }` · `{ operatingRegions: 1, isActive: 1 }`

### `Route` (optional, admin-managed)

Fixed point-to-point fares, which is how most hill-station transfers are
actually sold.

| Field | Type |
| --- | --- |
| `from` / `to` | String, required |
| `distanceKm` / `approxHours` | Number |
| `fares` | `[{ vehicle: ObjectId → Vehicle, price: Number }]` |
| `isActive` | Boolean |

**Index:** `{ from: 1, to: 1, isActive: 1 }`

### Quote calculation

Pure function in `lib/pricing/vehicle.ts`, unit-tested, used by both the public
quote endpoint and the admin booking screen so a customer and an admin can
never see different numbers:

```
perDay :  days × pricePerDay
        + driverAllowancePerDay × days
        + max(0, estimatedKm − includedKmPerDay × days) × extraKmCharge

perKm  :  max(estimatedKm, minimumBillingKmPerDay × days) × pricePerKm
        + driverAllowancePerDay × days

route  :  the fixed fare for (from, to, vehicle)
```

The response returns a **line-item breakdown**, never a bare total, so the
booking screen can show its working.

---

## Part C — Bookings

One `Booking` collection covers all three products. A discriminator field keeps
the shared fields (guest, status, totals, reference) in one place while the
product-specific block varies.

### `Booking`

| Field | Type | Notes |
| --- | --- | --- |
| `reference` | String, **unique**, indexed | `HOE-8F3K2Q` — what the guest quotes |
| `type` | enum `stay` \| `car` \| `package`, required | |
| `guest` | `{ name, email, phone, altPhone, notes }` | required |
| `guestCount` | `{ adults, children }` | |
| **`stayDetails`** | when `type = "stay"` | `{ stay, room, checkIn, checkOut, nights, units }` |
| **`carDetails`** | when `type = "car"` | `{ vehicle, route?, pickupAt, dropAt, pickupLocation, dropLocation, estimatedKm, days }` |
| **`packageDetails`** | when `type = "package"` | `{ package, startDate, travellers }` |
| `pricing` | `{ lineItems: [{ label, amount }], subtotal, taxes, discount, total, currency }` | snapshot — see below |
| `status` | enum `pending` \| `confirmed` \| `cancelled` \| `completed`, default `pending` | |
| `payment` | `{ status: unpaid\|partial\|paid, method, amountPaid, transactionId, paidAt }` | |
| `adminNotes` | String, `select: false` | internal only |
| `source` | enum `web` \| `admin`, default `web` | |

**Indexes**

```ts
{ reference: 1 }                                    // unique
{ status: 1, createdAt: -1 }                        // admin queue
{ "stayDetails.room": 1, "stayDetails.checkIn": 1, "stayDetails.checkOut": 1 }
{ "carDetails.vehicle": 1, "carDetails.pickupAt": 1 }
{ "guest.email": 1 }                                // guest lookup
```

### Pricing is a snapshot, not a reference

`pricing.lineItems` stores the resolved amounts at booking time. If the admin
raises the room rate tomorrow, an existing booking still shows what the guest
agreed to. Recomputing from live rates would silently rewrite history — this is
the single most important correctness decision in this module.

The server **always recomputes** the quote from the database before saving and
ignores any total sent by the client. The browser's number is a display
convenience; the server's number is the price.

### Preventing double-booking

Between "check availability" and "save booking" another guest can take the last
room. Handled with a conditional write rather than a read-then-write:

1. Recompute `unitsFree` inside the write path.
2. Insert only if still available, using a guarded `findOneAndUpdate` on a small
   `InventoryLock` document keyed by `(room, date)` — or, on a replica-set
   Atlas cluster, a short transaction around the count-and-insert.
3. On failure return `409 NO_AVAILABILITY` with the dates that conflict.

M0 clusters are replica sets, so transactions are available. The guarded-update
path is the fallback if the deployment ever moves to a standalone instance.

---

## Part D — API routes

### Public

| Method | Route | Notes |
| --- | --- | --- |
| `GET` | `/api/stays` | filters: `category`, `propertyType`, `locality`, `featured`, `q`, `page`, `limit` |
| `GET` | `/api/stays/[slug]` | property + its active rooms |
| `GET` | `/api/stays/[slug]/availability?from=&to=&adults=&children=` | per-room `unitsFree` + a per-room price for the range |
| `GET` | `/api/vehicles` | filters: `vehicleType`, `seats` (min), `region`, `featured`, `page`, `limit` |
| `GET` | `/api/vehicles/[slug]` | |
| `POST` | `/api/vehicles/quote` | `{ vehicle, pickupAt, dropAt, estimatedKm, route? }` → line-item breakdown |
| `GET` | `/api/routes?from=&to=` | fixed fares |
| `POST` | `/api/bookings` | **unauthenticated** — creates a `pending` booking |
| `GET` | `/api/bookings/[reference]?email=` | guest self-service; requires the matching email, returns a redacted view |

### Admin

| Method | Route |
| --- | --- |
| `POST` `PATCH` `DELETE` | `/api/stays`, `/api/stays/[id]` |
| `POST` `PATCH` `DELETE` | `/api/stays/[stayId]/rooms`, `/api/rooms/[id]` |
| `POST` `DELETE` | `/api/rooms/[id]/blackouts` |
| `POST` `PATCH` `DELETE` | `/api/vehicles`, `/api/vehicles/[id]` |
| `POST` `PATCH` `DELETE` | `/api/routes`, `/api/routes/[id]` |
| `GET` `PATCH` | `/api/admin/bookings`, `/api/admin/bookings/[id]` — status, payment, notes |
| `POST` | `/api/admin/bookings` — admin-created (walk-in / phone) booking |

**New cache tags:** `stays`, `stay:<slug>`, `vehicles`, `vehicle:<slug>`,
`routes`. Bookings are **never** cached — those routes export
`dynamic = "force-dynamic"`.

---

## Part E — Guest booking flow

This maps to the supplied `HomeStay-Booking` / `Step-1…Step-4` screens.

```
Stay detail ─► pick dates + room ─► Step 1  Guest details
                                    Step 2  Re-check (itemised summary)
                                    Step 3  Payment
                                    Step 4  Confirmation + reference code
```

- **Draft state lives in the URL + `sessionStorage`**, not the database. No
  abandoned-cart rows, no cleanup job, and a refresh does not lose the form.
- **Step 2 re-validates against the server.** Availability and price are fetched
  again; if either moved, the guest is told before they reach payment rather
  than after.
- **Step 3 — payment.** v1 ships **`payLater`**: the booking is created as
  `pending` / `unpaid` and the team confirms by phone. This keeps the free-tier
  deployment free of PCI surface and of a payment provider's webhook
  requirements.
  The `payment` sub-document and a `lib/payments/provider.ts` interface are in
  place so a Razorpay (or Stripe) integration is an additive change: implement
  `createOrder` / `verifySignature`, add one webhook route. **Flagging this
  clearly: online payment is not in v1.** If it is required for launch, say so
  and it moves into scope with its own doc.
- **Step 4** shows the reference code and sends two emails (guest confirmation,
  admin notification) via Resend's free tier. Email failure is logged but never
  fails the booking — the record already exists.

The car booking flow is the same four steps with a vehicle/route/date form in
place of the room picker.

---

## Part F — Admin screens

| Screen | Contents |
| --- | --- |
| **Stays** | table (name, locality, rooms, `priceFrom`, active); editor with amenities chips, image uploader, and a nested **Rooms** panel |
| **Rooms** (inside a stay) | inline rows: name, occupancy, rate, units, active; blackout-date manager per room |
| **Vehicles** | table (name, type, seats, rate); editor whose pricing block switches fields on `pricingMode` |
| **Routes** | from → to, distance, per-vehicle fare grid |
| **Bookings** | tabs Pending / Confirmed / Cancelled / Completed; filter by type and date; detail drawer showing the frozen line items, with actions to confirm, cancel, record payment, add notes |

The **Dashboard** gains: today's check-ins, today's pickups, and a pending
bookings count badge.

---

## Part G — SEO additions

New JSON-LD nodes, wired into the existing `@graph` in `lib/seo/schema.ts`:

- `Stay` → **`LodgingBusiness`** with `address`, `geo`, `amenityFeature`,
  `checkinTime`, `priceRange`, and `makesOffer` for each room.
- `Vehicle` → **`Product`** + `Offer`, plus `Service` with `areaServed` drawn
  from `operatingRegions`.
- `Route` → **`Service`** with `serviceType: "Taxi service"`.
- New `ItemList` nodes for `/stays` and `/cars`.

Sitemap gains `/stays`, `/stays/[slug]`, `/cars`, `/cars/[slug]`.
`/booking/*` and `/admin/*` stay `noindex`.

---

## Part H — Build order

1. `Stay` + `Room` models, admin CRUD, public list + detail — reuses the
   existing homestay UI, which currently reads from `lib/data/homestays.ts`.
2. Availability endpoint + `RoomBlackout`.
3. `Vehicle` + `Route` models, admin CRUD, public list + detail.
4. Quote engine + unit tests.
5. `Booking` model, public 4-step flow, admin bookings queue.
6. Emails, then JSON-LD and sitemap entries.

Steps 1–3 are pure CRUD and mirror the packages module closely. Steps 4–5 hold
the only genuinely novel logic — pricing and concurrency — and deserve the
tests.
