# ITR Cabs — Premium Kerala Travel Platform

A production-grade cab booking platform for **ITR Cabs** (Kakkanad, Ernakulam) — cinematic
scroll-driven marketing site, world-class booking engine and a full operations dashboard.

Built with **Next.js 15 · React 19 · TypeScript · Tailwind CSS v4 · Framer Motion · Prisma · PostgreSQL · Razorpay**.

---

## Highlights

- **Cinematic journey hero** — a scroll-driven drive through 7 hand-drawn SVG Kerala scenes
  (Kochi → Backwaters → Munnar → Athirappilly → Beach → Hairpins → Arrival) with a
  wheel-spinning, headlight-glowing ITR sedan, parallax layers, drifting fog, rain, birds
  and fireflies. Fully vector — zero image payload — and honours `prefers-reduced-motion`.
- **Booking engine** — 5-step wizard (trip → vehicle → details → OTP → ₹199 reserve) with
  passenger-aware vehicle filtering, server-side pricing, OTP phone verification (resend +
  countdown), Razorpay checkout with signature & webhook verification, animated
  confirmation with booking ID.
- **Admin command centre** — JWT-auth dashboard: overview KPIs, bookings management
  (search, filter, status changes, CSV export), fleet management with inline price editing
  and availability toggles, pricing engine view, customers, payments, CMS map, analytics.
- **SEO/GEO complete** — per-page metadata, canonical, OpenGraph/Twitter, JSON-LD
  (TaxiService LocalBusiness, Organization, FAQPage, Service, Review, BreadcrumbList,
  TouristTrip), sitemap.xml, robots.txt, RSS, manifest, semantic HTML, answer-shaped FAQ copy.
- **Motion system** — Lenis smooth scrolling + reusable Framer Motion primitives
  (TextReveal, MaskReveal, Stagger, TiltCard with cursor glow, Magnetic buttons, CountUp,
  marquees) tuned to one luxe easing curve.

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

The site runs fully in **demo mode** with zero configuration: bookings/OTP live in memory,
OTP codes are shown on screen, and a demo checkout stands in for Razorpay.

### Going live

1. Copy `.env.example` → `.env` and fill in values.
2. Database: set `DATABASE_URL`, then `npm run db:push && npm run db:seed`.
3. Payments: set the `RAZORPAY_*` keys (webhook endpoint: `/api/payments/webhook`).
4. OTP SMS: set `OTP_PROVIDER=msg91` (or `twilio`) plus its keys.
5. Set a strong `AUTH_SECRET`, `OTP_SECRET` and `SEED_ADMIN_PASSWORD`.

Demo admin: `admin@itrcabs.com` / `itrcabs@2026` → `/admin`.

## Architecture

```
src/
  app/
    (site)/            marketing + booking pages (navbar/footer layout)
      page.tsx         home — journey hero + 12 sections
      book/            booking wizard
      booking/[id]/    confirmation
      fleet/ services/ destinations/ about/ contact/
    admin/
      login/           auth
      (dashboard)/     overview, bookings, fleet, pricing, customers,
                       payments, cms, analytics, settings
    api/
      otp/ bookings/ payments/ admin/
    sitemap.ts robots.ts rss.xml/ manifest.ts
  components/
    home/ (hero/ + sections)  booking/  fleet/  admin/  layout/
    motion/            reusable animation primitives
    brand/             logo + vector fleet illustrations
    ui/                button, inputs, badges (shadcn-style)
  config/              fleet, services, destinations, faqs, testimonials, site
  lib/                 prisma, pricing engine, otp abstraction, razorpay,
                       auth (jose), booking store, schema.org builders
prisma/                schema + seed
```

### Key decisions

- **Demo-mode fallbacks** — every data path (`booking-store`, OTP store, fleet overrides,
  admin auth) checks `hasDatabase` and degrades to in-memory stores, so the entire product
  is testable before infrastructure exists.
- **Server-side pricing** — the client never sends prices; `lib/pricing.ts` recomputes
  every quote on the server from vehicle config.
- **OTP proof tokens** — verifying an OTP issues a short-lived JWT bound to the phone
  number; `/api/bookings` requires it, so bookings can never skip verification.
- **Provider abstraction** — `lib/otp.ts` exposes one interface with console/MSG91/Twilio
  implementations selected by env.

## Scripts

| Command             | Purpose                         |
| ------------------- | ------------------------------- |
| `npm run dev`       | Dev server (Turbopack)          |
| `npm run build`     | Production build                |
| `npm run db:push`   | Sync Prisma schema to DB        |
| `npm run db:seed`   | Seed fleet, admin, testimonials |
| `npm run db:studio` | Prisma Studio                   |
