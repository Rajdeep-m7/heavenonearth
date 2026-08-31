# Room stays & WhatsApp enquiries

**Nobody books or pays on the website.** For stays, packages, and every
travel service, the site's job stops at getting a qualified visitor into a
WhatsApp chat with the owner — the actual coordination, quoting, and
confirmation all happen there. This is a deliberate fit to how the business
already operates (the WhatsApp icon is already in the header's social rail),
not a placeholder for a future checkout flow.

Concretely, this means the site has:

- **No `Booking` model, no payment status, no reference codes, no 4-step
  guest flow.** All of that was speced in an earlier draft of this doc and is
  now dropped — there is nothing to build.
- **No `TravelRequest` model or admin queue for flights/cars/trains either.**
  A database-backed enquiry form was the previous plan; a WhatsApp button is
  simpler, matches reality (the business has no live fares to quote from
  regardless), and needs zero backend.
- **One small, reusable piece of new code:** a WhatsApp link builder, used
  everywhere a "Book" or "Enquire" action would otherwise be.

Room stays (`Stay` → `Room`) stay exactly as already built — they are the
**catalog**, not a booking engine. A stay/room page shows what is on offer and
its price; the call to action next to it opens WhatsApp instead of a
checkout.

---

## Part A — The WhatsApp handoff

### The pattern

Every "Book this stay", "Enquire about this room", "Ask about this package",
or "Plan a flight / car / train" button on the public site is a plain link:

```
https://wa.me/<phone>?text=<url-encoded message>
```

No form submission, no API call, no record created. `<phone>` is
`siteConfig.phone` (already defined in `lib/site.ts`); the message is built
client-side from whatever the visitor is looking at.

### `lib/whatsapp.ts` (to build)

```ts
import { siteConfig } from "@/lib/site";

export function whatsappLink(message: string): string {
  const phone = siteConfig.phone.replace(/[^\d]/g, ""); // wa.me wants digits only
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

// A few callers, so the phrasing stays consistent site-wide:
export const whatsappForPackage = (title: string, url: string) =>
  whatsappLink(`Hi! I'm interested in the "${title}" package (${url}). Could you share more details?`);

export const whatsappForRoom = (stayName: string, roomName: string, url: string) =>
  whatsappLink(`Hi! I'd like to ask about the ${roomName} at ${stayName} (${url}).`);

export const whatsappForService = (service: "flight" | "car" | "train") =>
  whatsappLink(`Hi! I'd like help arranging a ${service}.`);
```

### `components/ui/WhatsAppButton.tsx` (to build)

A thin wrapper around an `<a>` tag — `target="_blank" rel="noopener noreferrer"`,
the WhatsApp icon already in `components/ui/Icons.tsx`, styled to match the
gold/teal CTA treatment already used elsewhere (`Hero`, `FinalCta`). Takes the
pre-built `href` from one of the helpers above; it has no logic of its own.

### Where it appears

| Page | Button text | Message includes |
| --- | --- | --- |
| Package detail | "Enquire on WhatsApp" | package title + page URL |
| Stay detail, per room | "Ask About This Room" | stay name + room name + page URL |
| `/flights`, `/cars`, `/trains` | "Chat With Us on WhatsApp" | which service, nothing else — the conversation fills in the rest |
| Home page final CTA | "Start Planning" (already built) | generic — already links to `siteConfig.social.whatsapp`, unchanged |

`/flights`, `/cars`, and `/trains` are now simple static-ish pages: a short
description of what the business arranges, maybe a few example routes or
price ranges for orientation, and one WhatsApp button. No form fields, no
`type` discriminator, nothing to validate.

---

## Part B — Room stays (unchanged — already built)

Kept here for reference; nothing in this section changed by the WhatsApp
decision. `lib/db/models/Stay.ts` and `lib/db/models/Room.ts` are already
implemented exactly as described below.

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

`priceFrom` exists purely for **display** now — "from ₹6,500/night" on a card
— not to drive an availability check. It is still recalculated on every room
create/update/delete via `syncStayPriceFrom()`, because it would otherwise
drift and show a stale price.

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
| `pricePerNight` | Number, required, min 0 | shown on the card; not enforced against anything |
| `extraGuestCharge` | Number, default 0 | informational |
| `totalUnits` | Number, required, min 1 | informational — the business's own count, not tracked against bookings since the site does not take any |
| `amenities` | [String] | |
| `images` | [CloudinaryImage] | |
| `isActive` | Boolean, default `true` | |

**Indexes:** `{ stay: 1, isActive: 1 }`

There is deliberately **no availability engine, no `RoomBlackout` model, no
double-booking prevention** — all of that only matters when the site itself
confirms a reservation against a shrinking pool of units, which it does not.
If a returning need for real-time availability shows up later (e.g., a
channel-manager integration), it is a clean addition on top of this same
`Room` shape — nothing here blocks it.

---

## Part C — SEO

- `Stay` → **`LodgingBusiness`** with `address`, `geo`, `amenityFeature`,
  `checkinTime`, `priceRange`, and `makesOffer` for each room — unchanged.
  `Offer` has no `availability` field populated (schema.org allows omitting
  it); a WhatsApp CTA does not need one.
- `/flights`, `/cars`, `/trains` are ordinary indexable pages (good for
  "Darjeeling airport transfers", "train travel arranged from NJP" searches),
  marked up as `Service` with `areaServed`. Nothing about them is `noindex` —
  unlike the dropped `TravelRequest` confirmation screen, there is no
  guest-specific page to keep out of search results anymore.

Sitemap gains `/stays`, `/stays/[slug]`, `/flights`, `/cars`, `/trains`.

---

## Part D — Build order

1. `Stay` + `Room` models, admin CRUD, public list + detail — **already
   built**.
2. `lib/whatsapp.ts` + `WhatsAppButton` component.
3. Public `/stays` + `/stays/[slug]` pages, with a `WhatsAppButton` per room.
4. `/flights`, `/cars`, `/trains` — one shared layout, three copy blocks, one
   button each.
5. Wire the same button into package detail once `/packages/[slug]` exists.
6. JSON-LD + sitemap entries from Part C.

This is now the smallest module in the project — steps 2–4 are an afternoon,
not the multi-day build the booking-engine version would have been.
