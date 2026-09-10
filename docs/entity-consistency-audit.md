# ITR Cabs — entity consistency audit

Audit of how the business identifies itself across this codebase, and where
that conflicts with the canonical identity. **This file is documentation only.**
It changes nothing at runtime and is not linked from the site.

Last reviewed: 2026-09-10.

---

## Canonical identity

Everything below is the single source of truth, held in `src/config/site.ts`.
Nothing here may be invented — a value belongs in the config only once the
business has confirmed it.

| Field | Value |
|---|---|
| Business name | ITR Cabs |
| Parent business | ITR Groups |
| Website | https://cabs.livingbyitr.com/ |
| Phone | +91 80890 05500 |
| Email | itrgrp@gmail.com |
| Location | Kakkanad, Kochi, Kerala, India |
| Business type | Taxi / cab transportation service |
| Hours | Open 24 hours, 7 days a week |
| Instagram | https://www.instagram.com/itr_cabss/ |

**Naming rule.** The taxi business is *ITR Cabs* everywhere. *ITR Groups* is
the parent business and appears only where that relationship is the point —
the legal name and the `parentOrganization` in structured data. Do not
alternate between ITR Cab, ITR Taxi, ITR Groups Cabs or ITR Cab Services.

### Service areas

Only places the business genuinely serves. This list drives `areaServed` in
structured data; it is not a keyword list and should not be padded.

Kakkanad · Infopark · SmartCity · Thrikkakara · Kochi · Ernakulam ·
Cochin International Airport · Kerala (outstation)

---

## Inconsistencies found and corrected

### 1. Wrong canonical domain in the fallback

`siteConfig.url` fell back to `https://itrcabs.com` when
`NEXT_PUBLIC_SITE_URL` was unset. That value feeds `metadataBase`, so every
canonical tag, Open Graph URL and sitemap entry would have pointed at the
wrong host if the environment variable ever went missing.

Production has the variable set, so live output was correct — but the default
was one deploy-config mistake away from breaking every canonical on the site.

**Corrected:** the fallback is now `https://cabs.livingbyitr.com`.

### 2. Google rating published as 4.9 with 1,280+ reviews

Shown in three places — the homepage hero badge, the testimonials section and
the footer — sourced from `siteConfig.googleRating = { value: 4.9, count: 1280 }`.

Three separate problems:

- The figures do not match the Google Business Profile, which is understood to
  be approximately **4.7 with 87 reviews**. Neither number could be verified
  from anything in this project.
- The hero labelled the same count as "1,280+ Kerala journeys" while the stats
  section on the same page claimed "120,000+ journeys completed". The page
  contradicted itself by two orders of magnitude.
- It was also emitted as `aggregateRating` in structured data. Google's
  structured-data policy does not permit a site to mark up ratings collected
  on a third-party platform as its own.

**Corrected:** the `googleRating` value is removed from the config, the
`aggregateRating` is removed from the schema, and the three visible claims no
longer state a rating or a review count. The layout of all three blocks is
unchanged.

**Still to do (needs the business):** confirm the real rating and review count.
They should not be re-published as first-party structured data even then —
Google shows its own rating in its own surfaces. The visible text can cite them
if it attributes them to Google.

### 3. Unverified Google Business Profile link

The testimonials section linked to `https://g.page/itrcabs`, a vanity short
link that could not be confirmed as this business's listing, and the footer
implied the same listing.

**Corrected:** both are now driven by `siteConfig.social.googleBusinessProfile`,
which is deliberately empty. While empty, the site shows no Google rating and
links nowhere. Paste the genuine profile URL there and the Google link returns
in both places and is added to `sameAs` automatically.

> Use the share URL from the Google Business Profile dashboard. Do **not** use
> a Google search or Maps *search-result* URL.

### 4. Invented social profiles

`siteConfig.social` contained:

- `https://instagram.com/itrcabs` — wrong handle
- `https://facebook.com/itrcabs` — could not be confirmed to exist

Both were emitted in `sameAs`, which tells search engines "these accounts are
this business". A wrong `sameAs` is worse than none: it attaches the entity to
an account the business may not control.

**Corrected:** Instagram is now the confirmed `https://www.instagram.com/itr_cabss/`.
The unverified Facebook URL is removed. Add Facebook, YouTube and LinkedIn to
`siteConfig.social` once their real URLs are known; they flow into `sameAs`
automatically.

### 5. Three business entities where there should be one

The site emitted an `Organization` (`#organization`) and a `TaxiService`
(`#localbusiness`) from the root layout — on **every** page, including the
admin panel — plus a second `TaxiService` on the homepage reusing the
`#localbusiness` id to carry reviews. Two ids for one company, and one id used
twice with different content.

**Corrected:** a single `TaxiService` entity at `#business`, emitted once from
the public site layout, with `ITR Groups` as its `parentOrganization`.
Everything else references it by `@id`.

### 6. First-party review markup on testimonials

`reviewSchema()` marked the site's testimonial copy as `Review` objects with
star ratings. These could not be verified as genuine, attributable customer
reviews collected by the business.

**Corrected:** removed. The testimonials still display exactly as before — they
are simply no longer asserted to search engines as verified reviews.

### 7. Statistics rendered as "0+" to every crawler

The homepage stats animated from zero via JavaScript, so the server-rendered
HTML contained `<span>0+</span>`. Anything reading the page without executing
JavaScript — including search and AI crawlers — read "0+ journeys completed",
"0+ vehicles in fleet".

**Corrected:** the real figure is now in the HTML; the client winds it back and
animates it identically. No visual change.

---

## Unverified claims still published — business to confirm

These are pre-existing, owner-supplied figures. They have been left in place
because removing a business's own claims about itself is the owner's call, not
an automated one. **None of them could be verified from anything in this
project.** Each should be confirmed or removed.

| Claim | Where | Status |
|---|---|---|
| "30+ years of ITR trust", "Serving Kerala since 1995" | Homepage stats, About timeline | Corroborated *within the project* (`founded: 1995`, about-page history). Not independently verified. |
| "120,000+ journeys completed" | Homepage stats | Unverified |
| "60+ vehicles in fleet" | Homepage stats | Unverified. Note the fleet config lists **12 vehicle classes**, not 60 vehicles — these measure different things, which is easy to misread. |
| "98% on-time pickups" | Homepage stats | Unverified — no tracking source in the project |
| Street address "Infopark Kakkanad Road", postcode 682030 | `siteConfig.address`, `PostalAddress` schema | Locality/region/postcode are consistent with Kakkanad. The **street line** could not be confirmed. If ITR Cabs has no customer-facing office at a street address, this should become a service-area business without a street line. |
| Geo coordinates 10.0158, 76.3419 | `siteConfig.geo` | Plausible for Kakkanad; not confirmed against the real premises |

Say the word on any row and it is removed in one edit — each is a single value
in `src/config/site.ts` or `stats-section.tsx`.

---

## External listings

The website cannot edit third-party directories. **No third-party listing was
contacted or modified** — this section is a to-do list for manual work.

### Referenced in this project

| Profile | URL in project | Status |
|---|---|---|
| Instagram | https://www.instagram.com/itr_cabss/ | Confirmed, in use |
| Google Business Profile | *(was `g.page/itrcabs`)* | Removed as unverified; awaiting the real URL |
| Facebook | *(was `facebook.com/itrcabs`)* | Removed as unverified |

No Justdial, Quickerala, SafarCabby, Sulekha or IndiaMART links exist anywhere
in this codebase.

### Recommended manual corrections

For every external listing the business controls, make these match the
canonical identity **exactly** — NAP consistency (name, address, phone) is what
lets search engines merge listings into one entity rather than several:

1. **Name** — "ITR Cabs" exactly. Not "ITR Cab", "ITR Taxi" or "ITR Groups Cabs".
2. **Phone** — +91 80890 05500, the same number everywhere.
3. **Address** — the same wording and postcode as the Google Business Profile.
4. **Website** — `https://cabs.livingbyitr.com/`, with https and no `www`.
5. **Google Business Profile** — confirm the category is a taxi service, the
   service area covers Kakkanad/Kochi/Ernakulam/the airport, and hours show 24×7.
6. Once the Google profile URL is confirmed, add it to
   `siteConfig.social.googleBusinessProfile`. This is the strongest link between
   the website and the Google listing.
7. Audit any directory listing carrying an **old phone number or address** —
   those actively split the entity. Search the business name plus the phone
   number to find them.
