import { siteConfig } from "@/config/site";
import { faqs } from "@/config/faqs";

const BASE = siteConfig.url;

/**
 * One business entity for the whole site.
 *
 * Everything that needs to name ITR Cabs points at these ids rather than
 * repeating the details, so search engines resolve a single real-world
 * business instead of several competing ones. The site previously emitted an
 * Organization and a TaxiService describing the same company under different
 * ids, plus a second TaxiService on the homepage carrying reviews — three
 * entities where there should be one.
 */
export const BUSINESS_ID = `${BASE}/#business`;
export const WEBSITE_ID = `${BASE}/#website`;

/** A reference to the canonical business, for use inside other schema. */
export const businessRef = { "@id": BUSINESS_ID };

/**
 * A search-results page, not a profile.
 *
 * `sameAs` is meant to list pages that *represent* the business — its Google
 * Business Profile, its Instagram. A `google.com/search?q=...` link resolves
 * to a results page that happens to mention it, and carries whatever session
 * parameters the browser added. Publishing one as an identity claim weakens
 * the entity rather than strengthening it, so these are filtered out.
 */
const isSearchUrl = (url: string) => /google\.[a-z.]+\/search/.test(url);

/**
 * The canonical ITR Cabs entity.
 *
 * TaxiService is a subtype of LocalBusiness, so this carries the local-business
 * properties Google looks for while stating what the business actually does.
 *
 * Deliberately absent: aggregateRating and review. The ratings shown on this
 * site come from Google's own listing, and Google's structured-data policy
 * does not allow a site to mark up third-party reviews as its own. Publishing
 * them here risks a manual action and, more simply, would not be true.
 */
export function businessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "TaxiService",
    "@id": BUSINESS_ID,
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    description: siteConfig.description,
    url: BASE,
    logo: `${BASE}/logo.png`,
    image: `${BASE}/og.png`,
    telephone: siteConfig.phone,
    email: siteConfig.email,
    priceRange: "₹₹",
    currenciesAccepted: "INR",
    paymentAccepted: "Cash, UPI, Credit Card, Debit Card",
    foundingDate: siteConfig.founded,
    parentOrganization: {
      "@type": "Organization",
      name: siteConfig.parentOrganization,
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.street,
      addressLocality: siteConfig.address.locality,
      addressRegion: "Kerala",
      postalCode: siteConfig.address.postalCode,
      addressCountry: siteConfig.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: siteConfig.geo.lat,
      longitude: siteConfig.geo.lng,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "00:00",
      closes: "23:59",
    },
    /* Only places the business actually serves. */
    areaServed: siteConfig.serviceAreas.map((name) => ({ "@type": "Place", name })),
    contactPoint: {
      "@type": "ContactPoint",
      telephone: siteConfig.phone,
      contactType: "customer service",
      areaServed: "IN",
      availableLanguage: ["en", "ml", "hi"],
    },
    /* Confirmed profiles only. A Google *search* URL is excluded: sameAs is
       for pages that represent the business, and a results page is not one.
       A real Business Profile share link would belong here. */
    sameAs: Object.entries(siteConfig.social)
      .filter(
        ([key, url]) =>
          key !== "whatsappLink" && url.length > 0 && !isSearchUrl(url)
      )
      .map(([, url]) => url),
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: BASE,
    name: siteConfig.name,
    description: siteConfig.description,
    inLanguage: "en-IN",
    publisher: businessRef,
    about: businessRef,
  };
}

/**
 * Per-page node tying the page to the site and to the business. `type` narrows
 * it where the page has a specific role — AboutPage, ContactPage — which is
 * what lets a crawler tell "this page is about the business" from "this page
 * is the business's contact details".
 */
export function webPageSchema(opts: {
  path: string;
  name: string;
  description?: string;
  type?: "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage" | "ItemPage";
}) {
  const url = `${BASE}${opts.path}`;
  return {
    "@context": "https://schema.org",
    "@type": opts.type ?? "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: opts.name,
    ...(opts.description && { description: opts.description }),
    isPartOf: { "@id": WEBSITE_ID },
    about: businessRef,
    inLanguage: "en-IN",
  };
}

export function faqSchema(items = faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function serviceSchema(opts: { name: string; description: string; slug: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: opts.name,
    description: opts.description,
    url: `${BASE}/services/${opts.slug}`,
    provider: businessRef,
    areaServed: siteConfig.serviceAreas.map((name) => ({ "@type": "Place", name })),
    serviceType: "Taxi service",
  };
}

export function breadcrumbSchema(items: { name: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${BASE}${item.href}`,
    })),
  };
}
