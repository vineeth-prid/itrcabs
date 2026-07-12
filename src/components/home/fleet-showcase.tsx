import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAvailableFleet } from "@/lib/fleet-store";
import { SectionHeading } from "@/components/section-heading";
import { Stagger, StaggerItem, Reveal } from "@/components/motion/reveal";
import { VehicleCard } from "@/components/fleet/vehicle-card";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/motion/magnetic";

export async function FleetShowcase() {
  const fleet = await getAvailableFleet();
  const popular = fleet.filter((v) => v.popular);
  const highlights = [...popular, ...fleet.filter((v) => !v.popular)].slice(0, 4);

  return (
    <section className="relative bg-white py-24 md:py-32" aria-labelledby="fleet-heading">
      <div className="container-luxe">
        <SectionHeading
          eyebrow="Premium Fleet"
          title="From executive sedans to the"
          accent="Urbania lounge."
          description="Twelve vehicle classes, one standard of care — every car detailed, inspected and GPS-equipped before it reaches your door."
        />

        <Stagger className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4" gap={0.1}>
          {highlights.map((v) => (
            <StaggerItem key={v.slug} className="h-full">
              <VehicleCard vehicle={v} />
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal delay={0.15} className="mt-12 text-center">
          <Magnetic>
            <Link href="/fleet">
              <Button variant="outline" size="lg">
                View the full fleet <ArrowRight aria-hidden />
              </Button>
            </Link>
          </Magnetic>
        </Reveal>
      </div>
    </section>
  );
}
