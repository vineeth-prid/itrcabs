/**
 * Canonical business identity for ITR Cabs.
 *
 * This is the single source of truth: metadata, structured data, the footer
 * and every contact link read from here, so the entity can never drift between
 * pages. Nothing in here may be invented — a value belongs here only if it is
 * confirmed by the business. Unverified claims are recorded in
 * docs/entity-consistency-audit.md instead of being published.
 */
export const siteConfig = {
  name: "ITR Cabs",
  /** ITR Cabs is the taxi brand; ITR Groups is the parent business. */
  parentOrganization: "ITR Groups",
  legalName: "ITR Cabs — ITR Groups",
  tagline: "Kerala, driven beautifully.",
  description:
    "ITR Cabs is a taxi and cab booking service based in Kakkanad, Kochi. Airport transfers to Cochin International Airport, corporate and employee transport around Infopark and SmartCity, tempo traveller and Urbania rentals, and outstation trips across Kerala.",
  /* The live domain. Kept as the fallback too, so a missing environment
     variable can never point canonicals at the wrong host. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://cabs.livingbyitr.com",
  phone: "+918089005500",
  phoneDisplay: "8089 00 55 00",
  whatsapp: "918089005500",
  email: "itrgrp@gmail.com",
  address: {
    street: "Jumma Masjid Building, Kuzhikattumoola Junction, Opposite BP Petrol Bunk",
    locality: "Kakkanad",
    region: "Ernakulam, Kerala",
    postalCode: "682030",
    country: "IN",
  },
  geo: { lat: 10.0158, lng: 76.3419 },
  hours: "Open 24 hours, 7 days a week",
  /* ITR Groups' founding year, not ITR Cabs'. Kept for the company history
     the About page tells; deliberately not published as the cab business's
     foundingDate, which is a different and unconfirmed date. */
  groupFounded: "1995",
  /* Verified with the business. Shown with clear Google attribution and
     never emitted as aggregateRating — a site may not mark up ratings
     collected on a third-party platform as its own. */
  googleRating: { value: 4.7, count: 87 },
  /** Places ITR Cabs genuinely serves — used for areaServed, not for keywords. */
  serviceAreas: [
    "Kakkanad",
    "Infopark",
    "SmartCity",
    "Thrikkakara",
    "Kochi",
    "Ernakulam",
    "Cochin International Airport",
    "Kerala",
  ],
  social: {
    /* Confirmed profile only. A social URL is never guessed: an unverified
       sameAs is worse than none, because it links the entity to the wrong
       account. Add Facebook / YouTube / LinkedIn here once confirmed. */
    instagram: "https://www.instagram.com/itr_cabss/",
    /* Supplied by the business. Note this is a Google *search* URL, not a
       Business Profile link — it carries Chrome session parameters and
       resolves to a results page rather than the listing itself. Good enough
       to send a visitor to the reviews, so the visible links use it; kept out
       of sameAs, where a search URL is not an entity and would weaken the
       signal. Replace with the profile's own Share link to get both. */
    googleBusinessProfile:
      "https://www.google.com/search?q=itr+cabs&oq=itr&gs_lcrp=EgZjaHJvbWUqCAgAEEUYJxg7MggIABBFGCcYOzIGCAEQRRg5MgYIAhBFGDwyBggDEEUYPDIGCAQQRRg8MgYIBRAFGEAyBggGEEUYQTIGCAcQRRg80gEHNjIwajBqN6gCALACAA&sourceid=chrome&source=chrome.ob&ie=UTF-8",
    whatsappLink:
      "https://wa.me/918089005500?text=Hi%20ITR%20Cabs%2C%20I%27d%20like%20to%20book%20a%20cab.",
  },
  bookingAmount: 0,
  keywords: [
    "taxi service Kakkanad",
    "cab booking Kochi",
    "Kochi airport taxi",
    "Infopark cab service",
    "Ernakulam taxi",
    "corporate cab Kochi",
    "employee transportation Kochi",
    "tempo traveller Kerala",
    "Urbania rental Kerala",
    "outstation taxi Kerala",
  ],
} as const;

export type SiteConfig = typeof siteConfig;
