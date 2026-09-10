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
    street: "Infopark Kakkanad Road",
    locality: "Kakkanad",
    region: "Ernakulam, Kerala",
    postalCode: "682030",
    country: "IN",
  },
  geo: { lat: 10.0158, lng: 76.3419 },
  hours: "Open 24 hours, 7 days a week",
  founded: "1995",
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
    /* The real Google Business Profile share link, once confirmed. Empty
       means unverified: the site then shows no rating and links nowhere,
       rather than pointing people at a listing that may not be ours. Filling
       this in restores the Google links and adds it to sameAs automatically. */
    googleBusinessProfile: "",
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
