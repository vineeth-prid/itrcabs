import type { Metadata } from "next";
import { categories, ONE_DAY_INCLUDED_KM, MULTI_DAY_INCLUDED_KM } from "@/config/fleet";
import { getAvailableFleet } from "@/lib/fleet-store";
import { PageHero } from "@/components/page-hero";
import { VehicleCard } from "@/components/fleet/vehicle-card";
import { Stagger, StaggerItem, Reveal } from "@/components/motion/reveal";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/schema-org";
import { CheckCircle2, Info } from "lucide-react";

export const metadata: Metadata = {
  title: "Premium Fleet — Sedans, SUVs, Innova, Tempo Traveller & Urbania Rental Kerala",
  description:
    "Explore ITR Cabs' premium fleet in Kochi: sedans from ₹2,200/day, SUVs, Innova Crysta, Ertiga, Carens, 12–26 seat tempo travellers and Force Urbania rentals across Kerala. Transparent km-based pricing.",
  alternates: { canonical: "/fleet" },
};

const pricingRules = [
  { title: "One day trips", detail: `${ONE_DAY_INCLUDED_KM} km included in the base fare` },
  { title: "Multiple days", detail: `${MULTI_DAY_INCLUDED_KM} km included per day, carried over within your trip` },
  { title: "Driver bata", detail: "Included in your quote for multi-day journeys" },
  { title: "Extras at actuals", detail: "Additional km charges applicable · parking & toll extra · night charges if applicable" },
];

/* Pricing/availability is admin-editable — always render fresh */
export const dynamic = "force-dynamic";

export default async function FleetPage() {
  const fleet = await getAvailableFleet();
  return (
    <>
      <JsonLd schema={breadcrumbSchema([{ name: "Home", href: "/" }, { name: "Fleet", href: "/fleet" }])} />
      <PageHero
        eyebrow="The Fleet"
        title="Twelve ways to travel"
        accent="Kerala in comfort."
        description="Every vehicle detailed between trips, inspected on schedule and tracked by GPS — pick the one that fits your journey."
      />

      <section className="bg-cream py-20 md:py-24">
        <div className="container-luxe">
          {categories.map((cat) => {
            const vehicles = fleet.filter((v) => v.category === cat.value);
            if (vehicles.length === 0) return null;
            return (
              <div key={cat.value} className="mb-20 last:mb-0">
                <Reveal>
                  <h2 className="mb-8 flex items-center gap-4 font-display text-2xl font-bold text-ink sm:text-3xl">
                    {cat.label}
                    <span className="h-px flex-1 bg-ink/8" aria-hidden />
                    <span className="text-sm font-semibold text-smoke">{vehicles.length} option{vehicles.length > 1 ? "s" : ""}</span>
                  </h2>
                </Reveal>
                <Stagger className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3" gap={0.08}>
                  {vehicles.map((v) => (
                    <StaggerItem key={v.slug} className="h-full">
                      <VehicleCard vehicle={v} />
                    </StaggerItem>
                  ))}
                </Stagger>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing rules */}
      <section className="border-t hairline bg-white py-20 md:py-24" aria-labelledby="pricing-rules">
        <div className="container-luxe max-w-4xl">
          <Reveal>
            <h2 id="pricing-rules" className="text-center font-display text-3xl font-bold text-ink sm:text-4xl">
              Pricing without the <span className="font-serif italic text-gradient-gold">fine print.</span>
            </h2>
          </Reveal>
          <Stagger className="mt-12 grid gap-4 sm:grid-cols-2" gap={0.08}>
            {pricingRules.map((r) => (
              <StaggerItem key={r.title}>
                <div className="flex gap-4 rounded-2xl border hairline bg-cream p-6">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-gold-600" aria-hidden />
                  <div>
                    <h3 className="font-display font-bold text-ink">{r.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-smoke">{r.detail}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal delay={0.2}>
            <p className="mt-8 flex items-center justify-center gap-2 text-center text-sm text-smoke">
              <Info className="size-4 text-gold-600" aria-hidden />
              Every quote is itemised before you pay — the price you see is the price you sign off on.
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
