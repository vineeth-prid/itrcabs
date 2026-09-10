import { JsonLd } from "@/components/seo/json-ld";
import { businessSchema, websiteSchema } from "@/lib/schema-org";
import { Navbar } from "@/components/layout/navbar";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { Footer } from "@/components/layout/footer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-5 focus:py-2.5 focus:text-sm focus:font-bold focus:text-gold-400"
      >
        Skip to content
      </a>
      {/* The one ITR Cabs entity and the site it belongs to. Every page's
          own schema references these by @id rather than restating them. */}
      <JsonLd schema={businessSchema()} />
      <JsonLd schema={websiteSchema()} />
      <SmoothScroll />
      <Navbar />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
