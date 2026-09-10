# ITR Cabs — entity map

How ITR Cabs is described to search engines and AI crawlers, and where each
piece is defined. **Documentation only** — nothing here is rendered.

Last reviewed: 2026-09-11.

---

## The entity

```
                          ITR Cabs
                  (taxi brand of ITR Groups)
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
    IDENTITY             SERVICES              PLACES
        │                    │                    │
  Website ────────────  Airport taxi ──────  Kakkanad
  cabs.livingbyitr.com  Corporate cabs       Infopark
        │               Employee transport   SmartCity
  Instagram             Tempo traveller      Thrikkakara
  @itr_cabss            Urbania rental       Kochi
        │               Outstation trips     Ernakulam
  Google reviews        Wedding / events     Cochin Intl Airport
  4.7 from 87           Kerala tour packages Kerala (outstation)
        │
  Facebook   ─┐
  YouTube     ├─ not yet confirmed; add to siteConfig.social when known
  LinkedIn   ─┘
```

Every node above resolves to one machine-readable identity:

```
https://cabs.livingbyitr.com/#business
```

---

## Where each piece lives

| Concern | File |
|---|---|
| Canonical business facts | `src/config/site.ts` |
| Per-page Open Graph | `src/lib/seo.ts` |
| Structured data | `src/lib/schema-org.ts` |
| Titles, descriptions, OG, Twitter | `src/app/layout.tsx` + per-page `metadata` |
| Canonical URLs | per-page `alternates.canonical`, resolved against `metadataBase` |
| Crawler rules | `src/app/robots.ts` |
| Sitemap | `src/app/sitemap.ts` |
| Services | `src/config/services.ts` |
| Destinations | `src/config/destinations.ts` |

---

## Structured data by page

One entity, referenced everywhere. Only the homepage and the site layout
*define* the business; every other page points at it by `@id`.

| Page | Schema emitted |
|---|---|
| All public pages (site layout) | `TaxiService` `#business`, `WebSite` `#website` |
| `/` | `WebPage`, `FAQPage` |
| `/about` | `AboutPage`, `BreadcrumbList` |
| `/contact` | `ContactPage`, `FAQPage`, `BreadcrumbList` |
| `/fleet` | `CollectionPage`, `BreadcrumbList` |
| `/services` | `CollectionPage`, `BreadcrumbList`, `Service` per card |
| `/services/[slug]` | `ItemPage`, `Service`, `BreadcrumbList` |
| `/destinations` | `CollectionPage`, `BreadcrumbList` |
| `/destinations/[slug]` | `BreadcrumbList` |
| `/book` | `BreadcrumbList` |
| `/admin/**` | none — not public content |

Relationships:

```
WebSite  #website ──publisher/about──▶ TaxiService #business
WebPage  #webpage ──isPartOf────────▶ WebSite #website
                  ──about───────────▶ TaxiService #business
Service           ──provider────────▶ TaxiService #business
TaxiService       ──parentOrganization──▶ Organization "ITR Groups"
```

### Deliberately absent

- **`aggregateRating`** — the 4.7/87 belongs to Google's listing. It is shown on
  the site with attribution, but a site may not mark up ratings collected on a
  third-party platform as its own, so it stays out of the schema.
- **`Review`** — the on-site testimonials are not verified, attributable
  first-party reviews.
- **Fake properties** — no awards, certifications, fleet counts or membership
  claims are asserted in schema.

If the business starts collecting reviews *on its own site*, first-party
`Review` and `aggregateRating` become legitimate. Until then they stay out.

---

## Crawl surface

`robots.txt` allows everything public and names `OAI-SearchBot` explicitly so
ChatGPT search can read the site. Blocked: `/admin`, `/api/`, `/booking/`.

`/booking/<code>` is blocked because those pages show a customer's name, phone
and itinerary. Robots is not the security control there — the pages simply
should not be indexed.

The sitemap lists 25 canonical URLs: 7 static pages, 10 services, 8
destinations. It excludes admin, API, booking confirmations and any
query-parameter URL.

---

## Topic coverage

What the site can already rank for, from pages that exist today. **No new
location pages were created in this task.**

| Topic | Page |
|---|---|
| Airport taxi, Cochin International Airport | `/services/airport-transfer` |
| Corporate cabs | `/services/corporate-cab` |
| Employee transport, Infopark / SmartCity | `/services/employee-transportation` |
| Railway pickup | `/services/railway-pickup` |
| Outstation, Kerala tours | `/services/*`, `/destinations/*` |
| Tempo traveller / Urbania | `/fleet` |
| Kakkanad / Kochi / Ernakulam as a base | homepage, `/contact`, `areaServed` |

### Gap

There is no dedicated page for *taxi service in Kakkanad* or *Kochi* as a
location. Today those terms are carried only by the homepage and `areaServed`.
Dedicated location pages would be the strongest next step — and were
explicitly out of scope here. They should be written as genuinely useful pages
about serving that area, not as templated duplicates.
