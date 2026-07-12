import Link from "next/link";
import { Users, Briefcase, Snowflake, Fuel } from "lucide-react";
import type { VehicleSpec } from "@/config/fleet";
import { formatINR } from "@/lib/utils";
import { TiltCard } from "@/components/motion/tilt-card";
import { VehicleVisual } from "@/components/brand/vehicle-visual";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ONE_DAY_INCLUDED_KM } from "@/config/fleet";

export function VehicleCard({ vehicle, ctaHref }: { vehicle: VehicleSpec; ctaHref?: string }) {
  const href = ctaHref ?? `/book?vehicle=${vehicle.slug}`;
  return (
    <TiltCard className="h-full rounded-3xl">
      <article className="flex h-full flex-col overflow-hidden rounded-3xl border hairline bg-white shadow-card transition-shadow duration-500 group-hover:shadow-card-hover">
        <div className="relative bg-gradient-to-b from-sand to-white px-5 pt-5">
          <div className="absolute inset-x-5 top-5 z-10 flex items-start justify-between">
            <Badge variant="soft">{vehicle.categoryLabel}</Badge>
            {vehicle.popular && <Badge>Most booked</Badge>}
          </div>
          <div className="pt-9">
            <VehicleVisual
              slug={vehicle.slug}
              illustration={vehicle.illustration}
              name={vehicle.name}
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col p-6">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-display text-xl font-bold text-ink">{vehicle.name}</h3>
          </div>
          <p className="mt-0.5 text-[13px] text-smoke">{vehicle.examples}</p>
          <p className="mt-3 text-sm leading-relaxed text-graphite/80 line-clamp-2">{vehicle.tagline} — {vehicle.description}</p>

          <dl className="mt-5 grid grid-cols-4 gap-2 rounded-2xl bg-cream p-3 text-center">
            {[
              { icon: Users, label: "Seats", value: `${vehicle.seats}` },
              { icon: Briefcase, label: "Bags", value: `${vehicle.luggage}` },
              { icon: Snowflake, label: "AC", value: vehicle.ac ? "Yes" : "No" },
              { icon: Fuel, label: "Fuel", value: vehicle.fuel },
            ].map((s) => (
              <div key={s.label}>
                <dt className="flex items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-smoke">
                  <s.icon className="size-3" aria-hidden /> {s.label}
                </dt>
                <dd className="mt-0.5 text-[13px] font-bold text-ink">{s.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-auto flex items-end justify-between gap-3 pt-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-smoke">
                From · {ONE_DAY_INCLUDED_KM} km incl.
              </p>
              <p className="font-display text-2xl font-bold text-ink">
                {formatINR(vehicle.basePrice)}
                <span className="text-sm font-medium text-smoke">/day</span>
              </p>
            </div>
            <Link href={href}>
              <Button size="md">Book</Button>
            </Link>
          </div>
        </div>
      </article>
    </TiltCard>
  );
}
