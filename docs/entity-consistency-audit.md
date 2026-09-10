# ITR Cabs — entity consistency audit

Audit of how the business identifies itself across this codebase, and where
that conflicts with the canonical identity. **This file is documentation only.**
It changes nothing at runtime and is not linked from the site.

Last reviewed: 2026-09-11 — business figures and address verified.

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
| Address | Jumma Masjid Building, Kuzhikattumoola Junction, Opposite BP Petrol Bunk, Kakkanad, Kochi, Kerala |
| Business type | Taxi / cab transportation service |
| Hours | Open 24 hours, 7 days a week |
| Instagram | https://www.instagram.com/itr_cabss/ |
| Google reviews | 4.7 from 87 reviews (verified) |

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

**Corrected:** the unverified figures were pulled from the config and the
schema. The business has since confirmed **4.7 from 87 reviews**, and the two
dedicated blocks — the testimonials card and the footer — show that, clearly
attributed to Google. `aggregateRating` remains absent: these are Google's
reviews, not reviews collected on this site.

The hero badge and trust bar were **not** returned to stating a rating. They
now carry facts that do not need a source ("Chauffeur-driven across Kerala ·
Available 24×7", "Available 24×7"), which keeps the rating in the two places
built for it rather than repeated four times.

### 3. Unverified Google Business Profile link

The testimonials section linked to `https://g.page/itrcabs`, a vanity short
link that could not be confirmed as this business's listing, and the footer
implied the same listing.

**Corrected:** both are driven by `siteConfig.social.googleBusinessProfile`,
now populated with the URL the business supplied.

> **That URL is a Google *search* link, not a Business Profile link.** It is
> `google.com/search?q=itr+cabs&…` with Chrome session parameters attached. It
> works for sending a visitor to the reviews, so the visible links use it
> unchanged — but it is excluded from `sameAs`, where a results page is not an
> entity. Replacing it with the profile's own **Share** link would put it in
> both places. See "Three things to keep an eye on" below.

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

## Business figures — verified

Supplied and confirmed by the business on 2026-09-11. Every visible statistic
is one of these, and each label states exactly what it counts.

| Figure | Value | Shown on |
|---|---|---|
| Google rating | 4.7 | Testimonials card, footer — attributed to Google |
| Google reviews | 87 | Testimonials card, footer |
| Journeys completed | 7,000+ | Homepage stats |
| Fleet size | 20 vehicles | Homepage stats |
| Years on the road | 10+ | Homepage stats, trust bar |
| On-time pickups | 99% | Homepage stats |

These replaced the earlier unverified set: 4.9 with 1,280+ reviews, 120,000+
journeys, 60+ vehicles, 30 years, 98% on-time.

The rating and review count are **displayed** with clear Google attribution but
are still **not** emitted as `aggregateRating`. They are Google's data about the
business, not reviews collected on this site, and Google's structured-data
policy does not allow a site to mark up third-party reviews as its own.

### Three things to keep an eye on

**1. "10+ years" versus "since 1995".** The verified figure for ITR Cabs is 10+
years, but several places still describe ITR as beginning in 1995. They read
naturally as **ITR Groups**, the parent business, and were left alone on that
basis. If any is meant to describe *ITR Cabs*, it contradicts the verified
figure and should be reworded.

| Location | Wording |
|---|---|
| `app/(site)/about/page.tsx` | "ITR began in 1995…", "Three decades later…" |
| `components/about/about-timeline.tsx` | Timeline opening at 1995 |
| `components/home/why-itr.tsx` | "the ITR way since 1995" |
| `components/layout/footer.tsx` | "three decades of trust" |

`foundingDate` is no longer published in structured data: 1995 is ITR Groups'
year, and ITR Cabs' own founding year has not been confirmed.

**2. Postal code, locality and map pin.** The street line is now the verified
address, but PIN **682030** and locality **Kakkanad** carried over from the
previous configuration and were not restated. Confirm that Kuzhikattumoola
Junction falls within Kakkanad and that PIN. The contact-page map embed uses
coordinates 10.0158, 76.3419, also not re-verified — worth checking the pin
lands on the right building.

**3. The Google URL is a search link, not a profile.** The URL supplied is a
Chrome `google.com/search?q=itr+cabs&…` results page carrying browser session
parameters (`gs_lcrp`, `sourceid=chrome`, `source=chrome.ob`). It works for
sending a visitor to the reviews, so the visible links use it unchanged. It is
deliberately **excluded from `sameAs`**: that property is for pages which
*represent* the business, and a results page is not one — publishing it as an
identity claim would weaken the entity rather than strengthen it.

To get both, open the Google Business Profile → **Share** → copy that link
(it looks like `g.page/…`, `maps.app.goo.gl/…` or `share.google/…`) into
`siteConfig.social.googleBusinessProfile`. It will join `sameAs` automatically.

---

## External listings

The website cannot edit third-party directories. **No third-party listing was
contacted or modified** — this section is a to-do list for manual work.

### Referenced in this project

| Profile | URL in project | Status |
|---|---|---|
| Instagram | https://www.instagram.com/itr_cabss/ | Confirmed, in use |
| Google Business Profile | `google.com/search?q=itr+cabs&…` | Supplied by the business. A search URL, not a profile link — used for the visible links, excluded from `sameAs`. Replace with the profile Share link. |
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
