import { siteConfig } from "@/config/site";
import { destinations } from "@/config/destinations";
import { services } from "@/config/services";

export const dynamic = "force-static";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** RSS feed of travel guides & services — extends to BlogPost rows when the DB is connected. */
export async function GET() {
  const items = [
    ...destinations.map((d) => ({
      title: d.title,
      link: `${siteConfig.url}/destinations/${d.slug}`,
      description: d.description,
    })),
    ...services.map((s) => ({
      title: s.seoTitle,
      link: `${siteConfig.url}/services/${s.slug}`,
      description: s.seoDescription,
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteConfig.name)} — Kerala Travel Guides</title>
    <link>${siteConfig.url}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>en-in</language>
    <atom:link href="${siteConfig.url}/rss.xml" rel="self" type="application/rss+xml" />
    ${items
      .map(
        (i) => `<item>
      <title>${escapeXml(i.title)}</title>
      <link>${i.link}</link>
      <guid>${i.link}</guid>
      <description>${escapeXml(i.description)}</description>
    </item>`
      )
      .join("\n    ")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
