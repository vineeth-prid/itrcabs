import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

/**
 * Everything public is crawlable; nothing internal is.
 *
 * The disallow list is the admin panel, the API and the per-booking
 * confirmation pages — the last of these carry a customer's name, phone and
 * itinerary behind a guessable-looking code, so they have no business in an
 * index. It is not a security control: the admin panel is behind
 * authentication, and the booking pages should stay unguessable regardless.
 *
 * OAI-SearchBot is named explicitly so ChatGPT search can read the public
 * pages. It gets exactly the same access as everyone else — no more.
 */
const PRIVATE = ["/admin", "/admin/", "/api/", "/booking/"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE },
      { userAgent: "OAI-SearchBot", allow: "/", disallow: PRIVATE },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
