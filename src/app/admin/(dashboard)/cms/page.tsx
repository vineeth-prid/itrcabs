import Link from "next/link";
import { PageTitle, Panel } from "@/components/admin/ui";
import { services } from "@/config/services";
import { destinations } from "@/config/destinations";
import { testimonials } from "@/config/testimonials";
import { faqs } from "@/config/faqs";
import { fleet } from "@/config/fleet";

export const dynamic = "force-dynamic";

const sections = [
  { name: "Homepage hero", items: "7 journey scenes · headline · CTAs", page: "/", schema: "CmsSection(page: 'home', key: 'hero')" },
  { name: "About story", items: "7 timeline chapters", page: "/about", schema: "CmsSection(page: 'about', key: 'timeline')" },
  { name: "Fleet", items: `${fleet.length} vehicles`, page: "/fleet", schema: "Vehicle table" },
  { name: "Services", items: `${services.length} services`, page: "/services", schema: "CmsSection(page: 'services')" },
  { name: "Destinations & packages", items: `${destinations.length} destinations`, page: "/destinations", schema: "TourPackage table" },
  { name: "Testimonials", items: `${testimonials.length} approved`, page: "/#testimonials", schema: "Testimonial table" },
  { name: "FAQs", items: `${faqs.length} questions`, page: "/#faqs", schema: "CmsSection(page: 'home', key: 'faqs')" },
  { name: "Blog", items: "Ready for first post", page: "/", schema: "BlogPost table" },
  { name: "SEO", items: "Metadata · schema.org · sitemap", page: "/sitemap.xml", schema: "SiteSetting table" },
];

export default function AdminCmsPage() {
  return (
    <>
      <PageTitle
        title="CMS"
        sub="Content sections mapped to database models — editable once DATABASE_URL is connected; currently served from version-controlled config"
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sections.map((s) => (
          <Panel key={s.name}>
            <h2 className="font-display text-base font-bold text-white">{s.name}</h2>
            <p className="mt-1 text-sm text-cream/50">{s.items}</p>
            <p className="mt-3 rounded-lg bg-white/[0.04] px-3 py-2 font-mono text-[11px] text-cream/40">{s.schema}</p>
            <Link
              href={s.page}
              target="_blank"
              className="mt-4 inline-block text-sm font-bold text-gold-300 underline-offset-4 hover:underline"
            >
              Preview live page →
            </Link>
          </Panel>
        ))}
      </div>
    </>
  );
}
