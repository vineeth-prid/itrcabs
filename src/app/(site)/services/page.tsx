import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { services } from "@/config/services";
import { PageHero } from "@/components/page-hero";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema, serviceSchema } from "@/lib/schema-org";

export const metadata: Metadata = {
  title: "Services — Airport Taxi, Corporate Cabs & Kerala Tours",
  description:
    "ITR Cabs services in Kochi: airport transfers, railway pickups, corporate cabs, employee transportation, wedding cars, holiday packages, pilgrimage tours, luxury rentals and outstation trips across Kerala.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <JsonLd schema={breadcrumbSchema([{ name: "Home", href: "/" }, { name: "Services", href: "/services" }])} />
      <PageHero
        eyebrow="Services"
        title="Ten services, one"
        accent="standard of care."
        description="From a 4 am airport run to a 400-person wedding fleet — if it moves people in Kerala, we've perfected it."
      />

      <section className="bg-cream py-20 md:py-28">
        <div className="container-luxe">
          <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" gap={0.07}>
            {services.map((s) => (
              <StaggerItem key={s.slug} className="h-full">
                <TiltCard className="h-full rounded-3xl" maxTilt={4}>
                  <Link
                    href={`/services/${s.slug}`}
                    className="group/card flex h-full flex-col rounded-3xl border hairline bg-white p-8 shadow-card transition-shadow duration-500 hover:shadow-card-hover"
                  >
                    <JsonLd schema={serviceSchema({ name: s.name, description: s.short, slug: s.slug })} />
                    <div className="flex items-start justify-between">
                      <span className="flex size-13 items-center justify-center rounded-2xl bg-gold-100 text-gold-700 transition-all duration-500 group-hover/card:bg-gradient-gold group-hover/card:text-ink group-hover/card:shadow-glow">
                        <s.icon className="size-6" aria-hidden />
                      </span>
                      <ArrowUpRight className="size-5 text-smoke/50 transition-all duration-300 group-hover/card:-translate-y-1 group-hover/card:translate-x-1 group-hover/card:text-gold-600" aria-hidden />
                    </div>
                    <h2 className="mt-5 font-display text-xl font-bold text-ink">{s.name}</h2>
                    <p className="mt-2 flex-1 text-[15px] leading-relaxed text-smoke">{s.short}</p>
                    <span className="mt-5 text-sm font-bold text-gold-700">Explore service →</span>
                  </Link>
                </TiltCard>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    </>
  );
}
