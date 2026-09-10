import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

/** The shared social preview image, described once. */
export const ogImage = {
  url: "/og.png",
  width: 1200,
  height: 630,
  alt: `${siteConfig.name} — chauffeur-driven taxi service in Kakkanad, Kochi`,
};

/**
 * Open Graph fields for one page.
 *
 * Next merges a page's `openGraph` over the root's by replacing it, so a page
 * that sets only `url` loses the inherited image. Every page therefore states
 * its own address *and* carries the shared image through. Without the per-page
 * `url`, every page advertised the homepage as its canonical social target.
 */
export function pageOpenGraph(path: string, extra?: Metadata["openGraph"]): Metadata["openGraph"] {
  return {
    type: "website",
    locale: "en_IN",
    siteName: siteConfig.name,
    url: path,
    images: [ogImage],
    ...extra,
  };
}
