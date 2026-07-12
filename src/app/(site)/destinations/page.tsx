import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Clock, Route } from "lucide-react";
import { destinations } from "@/config/destinations";
import { PageHero } from "@/components/page-hero";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/schema-org";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Kerala Destinations — Munnar, Alleppey, Wayanad Taxi Packages",
  description:
    "Taxi packages from Kochi to Kerala's finest destinations: Munnar, Alleppey, Wayanad, Thekkady, Vagamon, Athirappilly, Kumarakom and Kochi city tours. Dedicated cars, expert drivers, transparent pricing.",
  alternates: { canonical: "/destinations" },
};

export default function DestinationsPage() {
  return (
    <>
      <JsonLd schema={breadcrumbSchema([{ name: "Home", href: "/" }, { name: "Destinations", href: "/destinations" }])} />
      <PageHero
        eyebrow="Destinations"
        title="Where should Kerala"
        accent="take you first?"
        description="Eight signature routes, driven thousands of times — with the viewpoints, food stops and timings only local drivers know."
      />

      <section className="bg-cream py-20 md:py-28">
        <div className="container-luxe">
          <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" gap={0.08}>
            {destinations.map((d, i) => (
              <StaggerItem key={d.slug} className={cn("h-full", i % 4 === 0 || i % 4 === 3 ? "lg:col-span-2" : "")}>
                <Link
                  href={`/destinations/${d.slug}`}
                  className={cn(
                    "group relative flex h-full min-h-[300px] flex-col justify-end overflow-hidden rounded-3xl bg-gradient-to-br p-7 transition-all duration-500 ease-[var(--ease-luxe)] hover:-translate-y-2 hover:shadow-card-hover",
                    d.gradient
                  )}
                >
                  <div aria-hidden className="absolute inset-0 bg-dot-grid opacity-15" />
                  <span aria-hidden className="absolute right-6 top-6 text-5xl transition-transform duration-500 group-hover:scale-125 group-hover:-rotate-6">
                    {d.emoji}
                  </span>
                  <div className="relative">
                    <h2 className="font-display text-2xl font-bold text-white">{d.name}</h2>
                    <p className="mt-1.5 text-sm text-white/75">{d.blurb}</p>
                    <div className="mt-4 flex flex-wrap gap-2 text-[12px] font-semibold text-white/90">
                      {d.distanceKm > 0 && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-black/25 px-3 py-1 backdrop-blur-sm">
                          <Route className="size-3.5" aria-hidden /> {d.distanceKm} km from Kochi
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-black/25 px-3 py-1 backdrop-blur-sm">
                        <Clock className="size-3.5" aria-hidden /> {d.driveTime}
                      </span>
                    </div>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-gold-300 transition-all duration-300 group-hover:gap-3">
                      Plan this trip <ArrowUpRight className="size-4" aria-hidden />
                    </span>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    </>
  );
}
