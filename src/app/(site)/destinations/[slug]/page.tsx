import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Clock, CalendarDays, ArrowRight, Sparkles } from "lucide-react";
import { destinations, getDestination } from "@/config/destinations";
import { getAvailableFleet } from "@/lib/fleet-store";
import { PageHero } from "@/components/page-hero";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { VehicleCard } from "@/components/fleet/vehicle-card";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/schema-org";

export function generateStaticParams() {
  return destinations.map((d) => ({ slug: d.slug }));
}

/* Vehicle prices are admin-editable — refresh statically-generated pages every minute */
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const dest = getDestination(slug);
  if (!dest) return {};
  return {
    title: dest.title,
    description: `${dest.description.slice(0, 150)}… Book a ${dest.name} taxi with ITR Cabs — dedicated car, expert driver, transparent pricing.`,
    alternates: { canonical: `/destinations/${dest.slug}` },
    openGraph: { title: dest.title },
  };
}

export default async function DestinationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const dest = getDestination(slug);
  if (!dest) notFound();

  const available = await getAvailableFleet();
  const rides = dest.idealVehicles
    .map((s) => available.find((v) => v.slug === s))
    .filter((v): v is NonNullable<typeof v> => Boolean(v));

  const tripSchema = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: dest.title,
    description: dest.description,
    touristType: "Leisure",
    itinerary: dest.highlights.map((h) => ({ "@type": "TouristAttraction", name: h })),
    provider: { "@type": "TaxiService", name: "ITR Cabs" },
  };

  return (
    <>
      <JsonLd
        schema={breadcrumbSchema([
          { name: "Home", href: "/" },
          { name: "Destinations", href: "/destinations" },
          { name: dest.name, href: `/destinations/${dest.slug}` },
        ])}
      />
      <JsonLd schema={tripSchema} />

      <PageHero eyebrow={`Destination ${dest.emoji}`} title={dest.name} description={dest.description}>
        <Reveal delay={0.3}>
          <dl className="mt-8 flex flex-wrap gap-3">
            {[
              ...(dest.distanceKm > 0 ? [{ icon: MapPin, label: `${dest.distanceKm} km from Kochi` }] : []),
              { icon: Clock, label: dest.driveTime },
              { icon: CalendarDays, label: `Best: ${dest.bestSeason}` },
            ].map((c) => (
              <div key={c.label} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-cream/90">
                <c.icon className="size-4 text-gold-400" aria-hidden /> {c.label}
              </div>
            ))}
          </dl>
        </Reveal>
        <Reveal delay={0.4}>
          <div className="mt-9">
            <Link href="/book">
              <Button size="lg">Book a {dest.name} trip <ArrowRight aria-hidden /></Button>
            </Link>
          </div>
        </Reveal>
      </PageHero>

      <section className="bg-cream py-20 md:py-24">
        <div className="container-luxe max-w-4xl">
          <Reveal>
            <h2 className="font-display text-3xl font-bold text-ink">
              Don&rsquo;t miss<span className="text-gradient-gold">.</span>
            </h2>
          </Reveal>
          <Stagger className="mt-8 grid gap-4 sm:grid-cols-2" gap={0.08}>
            {dest.highlights.map((h, i) => (
              <StaggerItem key={h}>
                <div className="flex items-center gap-4 rounded-2xl border hairline bg-white p-5 shadow-card">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gold-100 font-display text-sm font-bold text-gold-700">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="font-semibold text-graphite">{h}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="border-t hairline bg-white py-20 md:py-24">
        <div className="container-luxe">
          <Reveal>
            <h2 className="mb-2 text-center font-display text-3xl font-bold text-ink">
              The right cars for this route
            </h2>
            <p className="mb-10 flex items-center justify-center gap-2 text-center text-smoke">
              <Sparkles className="size-4 text-gold-600" aria-hidden />
              Picked by drivers who run the {dest.name} road every week
            </p>
          </Reveal>
          <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" gap={0.1}>
            {rides.map((v) => (
              <StaggerItem key={v.slug} className="h-full">
                <VehicleCard vehicle={v} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    </>
  );
}
