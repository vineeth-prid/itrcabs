import { siteConfig } from "@/config/site";
import { faqs } from "@/config/faqs";
import { testimonials } from "@/config/testimonials";

const BASE = siteConfig.url;

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${BASE}/#organization`,
    name: siteConfig.name,
    url: BASE,
    logo: `${BASE}/logo.png`,
    email: siteConfig.email,
    telephone: siteConfig.phone,
    foundingDate: siteConfig.founded,
    sameAs: [siteConfig.social.instagram, siteConfig.social.facebook],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: siteConfig.phone,
      contactType: "customer service",
      areaServed: "IN",
      availableLanguage: ["en", "ml", "hi"],
    },
  };
}

export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "TaxiService",
    "@id": `${BASE}/#localbusiness`,
    name: siteConfig.name,
    image: `${BASE}/og.png`,
    url: BASE,
    telephone: siteConfig.phone,
    email: siteConfig.email,
    priceRange: "₹₹",
    currenciesAccepted: "INR",
    paymentAccepted: "Cash, UPI, Credit Card, Debit Card",
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
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: siteConfig.googleRating.value,
      reviewCount: siteConfig.googleRating.count,
      bestRating: 5,
    },
    areaServed: [
      "Kochi", "Ernakulam", "Kakkanad", "Munnar", "Alleppey", "Kumarakom",
      "Thekkady", "Vagamon", "Athirappilly", "Wayanad", "Thrissur",
      "Kozhikode", "Kannur", "Trivandrum", "Kerala",
    ].map((name) => ({ "@type": "City", name })),
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
    provider: { "@id": `${BASE}/#localbusiness` },
    areaServed: { "@type": "State", name: "Kerala" },
    serviceType: "Taxi service",
  };
}

export function reviewSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "TaxiService",
    "@id": `${BASE}/#localbusiness`,
    name: siteConfig.name,
    review: testimonials.slice(0, 6).map((t) => ({
      "@type": "Review",
      author: { "@type": "Person", name: t.name },
      reviewRating: { "@type": "Rating", ratingValue: t.rating, bestRating: 5 },
      reviewBody: t.text,
    })),
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
