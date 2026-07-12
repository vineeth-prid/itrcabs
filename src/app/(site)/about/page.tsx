import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/motion/reveal";
import { AboutTimeline } from "@/components/about/about-timeline";
import { StatsSection } from "@/components/home/stats-section";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/schema-org";

export const metadata: Metadata = {
  title: "About ITR Cabs — 30 Years of Trust on Kerala's Roads",
  description:
    "The ITR story: from a single humble venture in 1995 to Kerala's most trusted premium cab company — GPS-enabled fleet, professional operations and customers across the state. Service at your doorstep.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <JsonLd schema={breadcrumbSchema([{ name: "Home", href: "/" }, { name: "About", href: "/about" }])} />
      <PageHero
        eyebrow="Our Story"
        title="Thirty years on the road,"
        accent="one promise kept."
        description="ITR began in 1995 with a single humble venture and a stubborn belief: treat every customer like family and the road will rise to meet you. Three decades later, that belief drives one of Kerala's most trusted travel companies."
      />

      <AboutTimeline />

      <StatsSection />

      <section className="bg-cream py-20 md:py-28">
        <div className="container-luxe max-w-3xl text-center">
          <Reveal>
            <p className="font-serif text-2xl italic text-gold-700">&ldquo;Service at your doorstep.&rdquo;</p>
            <p className="mt-6 text-lg leading-relaxed text-graphite">
              It started as a motto. It became a discipline — the reason companies
              trust us with their employees at 2 am, families trust us with their
              parents on hill roads, and travellers from around the world start
              their Kerala story in an ITR cab.
            </p>
            <div className="mt-10">
              <Link href="/book">
                <Button size="xl">Travel with us <ArrowRight aria-hidden /></Button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
